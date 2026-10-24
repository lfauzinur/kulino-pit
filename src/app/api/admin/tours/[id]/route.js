import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql, tourRow } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const textList = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
const imageList = (value) => Array.isArray(value) ? value.map((item) => ({
  url: String(typeof item === 'string' ? item : item?.url || '').trim(),
  publicId: String(typeof item === 'string' ? '' : item?.publicId || '').trim(),
})).filter((item) => item.url).slice(0, 20) : [];
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function getId(params) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    const body = await request.json();
    const name = String(body.name || '').trim();
    const slug = slugify(body.slug || name);
    const duration = String(body.duration || '').trim();
    const price = Number(body.price);
    const categoryId = Number(body.categoryId);
    if (!id || !name || !slug || !duration || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(categoryId)) {
      return NextResponse.json({ error: 'Data paket tour tidak valid.' }, { status: 400, headers: noStore });
    }
    const duplicate = await sql`SELECT id FROM tour_packages WHERE (LOWER(name) = LOWER(${name}) OR slug = ${slug}) AND id <> ${id} LIMIT 1`;
    if (duplicate.length) return NextResponse.json({ error: 'Paket tour dengan nama tersebut sudah ada.' }, { status: 409, headers: noStore });
    const rows = await sql`
      UPDATE tour_packages p
      SET name = ${name}, slug = ${slug}, price = ${price}, category_id = ${categoryId}, duration = ${duration},
          distance = ${String(body.distance || '').trim()}, difficulty_id = ${String(body.difficultyId || 'Mudah').trim()},
          difficulty_en = ${String(body.difficultyEn || 'Easy').trim()},
          description_id = ${String(body.descriptionId || '').trim()},
          description_en = ${String(body.descriptionEn || body.descriptionId || '').trim()},
          image = ${String(body.image || '/images/hero-banner.png')}, image_public_id = ${body.imagePublicId || null},
          gallery = ${JSON.stringify(imageList(body.gallery))}::jsonb,
          includes_id = ${JSON.stringify(textList(body.includesId))}::jsonb,
          includes_en = ${JSON.stringify(textList(body.includesEn))}::jsonb,
          meeting_point = ${String(body.meetingPoint || 'Kulino House, Banyuwangi').trim()},
          published = ${body.published !== false}, updated_at = NOW()
      FROM tour_categories c
      WHERE p.id = ${id} AND c.id = ${categoryId}
      RETURNING p.*, c.name AS category_name
    `;
    if (!rows.length) return NextResponse.json({ error: 'Paket atau kategori tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(tourRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/admin/tours/[id] error:', error);
    return NextResponse.json({ error: 'Paket tour gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
    const type = request.nextUrl.searchParams.get('type');
    if (type === 'category') {
      const inUse = await sql`SELECT COUNT(*)::int AS count FROM tour_packages WHERE category_id = ${id}`;
      if (Number(inUse[0].count) > 0) {
        return NextResponse.json({ error: 'Kategori masih digunakan paket tour. Pindahkan atau hapus paketnya lebih dulu.' }, { status: 409, headers: noStore });
      }
      const rows = await sql`DELETE FROM tour_categories WHERE id = ${id} RETURNING id`;
      if (!rows.length) return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404, headers: noStore });
      return NextResponse.json({ success: true }, { headers: noStore });
    }
    if (type === 'tour') {
      const rows = await sql`DELETE FROM tour_packages WHERE id = ${id} RETURNING id`;
      if (!rows.length) return NextResponse.json({ error: 'Paket tidak ditemukan.' }, { status: 404, headers: noStore });
      return NextResponse.json({ success: true }, { headers: noStore });
    }
    return NextResponse.json({ error: 'Tipe data tidak valid.' }, { status: 400, headers: noStore });
  } catch (error) {
    console.error('DELETE /api/admin/tours/[id] error:', error);
    return NextResponse.json({ error: 'Data tour gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
