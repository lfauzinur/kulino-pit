import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { articleRow, ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export async function GET(request, { params }) {
  try {
    await ensureAppDatabase();
    const { slug } = await params;
    const includeDraft = new URL(request.url).searchParams.get('admin') === '1';
    if (includeDraft && !(await requireAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
    }
    const rows = includeDraft
      ? await sql`SELECT * FROM articles WHERE slug = ${decodeURIComponent(slug)}`
      : await sql`SELECT * FROM articles WHERE slug = ${decodeURIComponent(slug)} AND status = 'published' AND published_global = true`;
    if (!rows.length) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });
    return NextResponse.json(articleRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('GET /api/articles/[slug] error:', error);
    return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const { slug: routeSlug } = await params;
    const currentSlug = decodeURIComponent(routeSlug);
    const body = await request.json();
    const titleId = String(body.titleId || body.title || '').trim();
    const titleEn = String(body.titleEn || titleId).trim();
    const nextSlug = slugify(body.slug || titleId);
    if (!titleId || !nextSlug) {
      return NextResponse.json({ error: 'Judul artikel wajib diisi.' }, { status: 400, headers: noStore });
    }

    const conflicts = await sql`SELECT 1 FROM articles WHERE slug = ${nextSlug} AND slug <> ${currentSlug}`;
    if (conflicts.length) {
      return NextResponse.json({ error: 'Slug sudah digunakan artikel lain.' }, { status: 409, headers: noStore });
    }

    const blocks = Array.isArray(body.blocks) ? body.blocks : [];
    const firstText = blocks.find((block) => block.type === 'text')?.content || '';
    const imageBlock = blocks.find((block) => block.type === 'image' && block.url);
    const status = body.status === 'draft' ? 'draft' : 'published';
    const publishedAt = status === 'published' ? new Date(body.publishedAt || Date.now()).toISOString() : null;
    const rows = await sql`
      UPDATE articles SET
        slug = ${nextSlug}, title_id = ${titleId}, title_en = ${titleEn},
        excerpt_id = ${String(body.excerptId || firstText).slice(0, 500)},
        excerpt_en = ${String(body.excerptEn || firstText).slice(0, 500)},
        content = ${JSON.stringify(blocks)}::jsonb,
        image = ${imageBlock?.url || body.image || '/images/bikes/roadbike.png'},
        image_public_id = ${imageBlock?.publicId || null}, author = ${String(body.author || 'Kulino Team')},
        category_id = ${String(body.categoryId || 'Berita')},
        category_en = ${String(body.categoryEn || body.categoryId || 'News')},
        tags = ${JSON.stringify(Array.isArray(body.tags) ? body.tags : [])}::jsonb,
        meta_title = ${String(body.metaTitle || '')}, meta_description = ${String(body.metaDescription || '')},
        keywords = ${String(body.keywords || '')}, canonical_url = ${String(body.canonical || '')},
        published_global = ${Boolean(body.publishedGlobally)}, published_english = ${Boolean(body.publishedEnglish)},
        status = ${status}, published_at = ${publishedAt}, updated_at = NOW()
      WHERE slug = ${currentSlug}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(articleRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/articles/[slug] error:', error);
    return NextResponse.json({ error: 'Artikel gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const { slug } = await params;
    const rows = await sql`DELETE FROM articles WHERE slug = ${decodeURIComponent(slug)} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/articles/[slug] error:', error);
    return NextResponse.json({ error: 'Artikel gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
