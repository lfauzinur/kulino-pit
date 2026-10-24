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

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const includeDrafts = new URL(request.url).searchParams.get('admin') === '1';
    if (includeDrafts && !(await requireAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
    }
    const rows = includeDrafts
      ? await sql`SELECT * FROM articles ORDER BY created_at DESC`
      : await sql`SELECT * FROM articles WHERE status = 'published' AND published_global = true ORDER BY published_at DESC NULLS LAST, created_at DESC`;
    return NextResponse.json(rows.map(articleRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/articles error:', error);
    return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const titleId = String(body.titleId || body.title || '').trim();
    const titleEn = String(body.titleEn || titleId).trim();
    const baseSlug = slugify(body.slug || titleId);
    if (!titleId || !baseSlug) return NextResponse.json({ error: 'Judul artikel wajib diisi.' }, { status: 400 });
    const existing = await sql`SELECT 1 FROM articles WHERE slug = ${baseSlug}`;
    const slug = existing.length ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;
    const blocks = Array.isArray(body.blocks) ? body.blocks : [];
    const firstText = blocks.find((block) => block.type === 'text')?.content || '';
    const imageBlock = blocks.find((block) => block.type === 'image' && block.url);
    const status = body.status === 'draft' ? 'draft' : 'published';
    const rows = await sql`
      INSERT INTO articles (
        slug, title_id, title_en, excerpt_id, excerpt_en, content, image, image_public_id,
        author, category_id, category_en, tags, meta_title, meta_description, keywords,
        canonical_url, published_global, published_english, status, published_at
      ) VALUES (
        ${slug}, ${titleId}, ${titleEn}, ${String(body.excerptId || firstText).slice(0, 500)},
        ${String(body.excerptEn || firstText).slice(0, 500)}, ${JSON.stringify(blocks)}::jsonb,
        ${imageBlock?.url || body.image || '/images/bikes/roadbike.png'}, ${imageBlock?.publicId || null},
        ${String(body.author || 'Kulino Team')}, ${String(body.categoryId || 'Berita')},
        ${String(body.categoryEn || body.categoryId || 'News')}, ${JSON.stringify(Array.isArray(body.tags) ? body.tags : [])}::jsonb,
        ${String(body.metaTitle || '')}, ${String(body.metaDescription || '')}, ${String(body.keywords || '')},
        ${String(body.canonical || '')}, ${Boolean(body.publishedGlobally)}, ${Boolean(body.publishedEnglish)},
        ${status}, ${status === 'published' ? new Date(body.publishedAt || Date.now()).toISOString() : null}
      ) RETURNING *
    `;
    return NextResponse.json(articleRow(rows[0]), { status: 201 });
  } catch (error) {
    console.error('POST /api/articles error:', error);
    return NextResponse.json({ error: 'Artikel gagal disimpan.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const body = await request.json();
    const slugs = [...new Set((Array.isArray(body.slugs) ? body.slugs : [])
      .map((slug) => String(slug || '').trim())
      .filter(Boolean))];
    if (!slugs.length) {
      return NextResponse.json({ error: 'Pilih minimal satu artikel.' }, { status: 400, headers: noStore });
    }
    if (slugs.length > 100) {
      return NextResponse.json({ error: 'Maksimal 100 artikel per penghapusan.' }, { status: 400, headers: noStore });
    }

    const rows = await sql`
      DELETE FROM articles
      WHERE slug IN (
        SELECT jsonb_array_elements_text(${JSON.stringify(slugs)}::jsonb)
      )
      RETURNING slug
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'Artikel terpilih tidak ditemukan.' }, { status: 404, headers: noStore });
    }
    return NextResponse.json({ success: true, deleted: rows.map((row) => row.slug) }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/articles error:', error);
    return NextResponse.json({ error: 'Artikel gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
