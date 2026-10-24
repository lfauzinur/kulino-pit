import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql, tourRow } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function categoryRow(row) {
  return { id: Number(row.id), name: row.name };
}

const textList = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
const imageList = (value) => Array.isArray(value) ? value.map((item) => ({
  url: String(typeof item === 'string' ? item : item?.url || '').trim(),
  publicId: String(typeof item === 'string' ? '' : item?.publicId || '').trim(),
})).filter((item) => item.url).slice(0, 20) : [];
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function loadTourData() {
  const [categories, tours] = await Promise.all([
    sql`SELECT * FROM tour_categories ORDER BY name ASC`,
    sql`
      SELECT p.*, c.name AS category_name
      FROM tour_packages p
      JOIN tour_categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC, p.id DESC
    `,
  ]);
  return { categories: categories.map(categoryRow), tours: tours.map(tourRow) };
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    return NextResponse.json(await loadTourData(), { headers: noStore });
  } catch (error) {
    console.error('GET /api/admin/tours error:', error);
    return NextResponse.json({ error: 'Data tour gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const body = await request.json();
    if (body.type === 'category') {
      const name = String(body.name || '').trim();
      if (!name) return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400, headers: noStore });
      const existing = await sql`SELECT id FROM tour_categories WHERE LOWER(name) = LOWER(${name}) LIMIT 1`;
      if (existing.length) return NextResponse.json({ error: 'Kategori dengan nama tersebut sudah ada.' }, { status: 409, headers: noStore });
      const rows = await sql`INSERT INTO tour_categories (name) VALUES (${name}) RETURNING *`;
      return NextResponse.json(categoryRow(rows[0]), { status: 201, headers: noStore });
    }

    if (body.type === 'tour') {
      const name = String(body.name || '').trim();
      const duration = String(body.duration || '').trim();
      const slug = slugify(body.slug || name);
      const price = Number(body.price);
      const categoryId = Number(body.categoryId);
      if (!name || !slug || !duration || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(categoryId)) {
        return NextResponse.json({ error: 'Nama, kategori, harga, dan durasi wajib valid.' }, { status: 400, headers: noStore });
      }
      const existing = await sql`SELECT id FROM tour_packages WHERE LOWER(name) = LOWER(${name}) OR slug = ${slug} LIMIT 1`;
      if (existing.length) return NextResponse.json({ error: 'Paket tour dengan nama tersebut sudah ada.' }, { status: 409, headers: noStore });
      const rows = await sql`
        INSERT INTO tour_packages (
          name, slug, price, category_id, duration, distance, difficulty_id, difficulty_en,
          description_id, description_en, image, image_public_id, gallery, includes_id, includes_en,
          meeting_point, published
        )
        SELECT ${name}, ${slug}, ${price}, id, ${duration}, ${String(body.distance || '').trim()},
          ${String(body.difficultyId || 'Mudah').trim()}, ${String(body.difficultyEn || 'Easy').trim()},
          ${String(body.descriptionId || '').trim()}, ${String(body.descriptionEn || body.descriptionId || '').trim()},
          ${String(body.image || '/images/hero-banner.png')}, ${body.imagePublicId || null},
          ${JSON.stringify(imageList(body.gallery))}::jsonb,
          ${JSON.stringify(textList(body.includesId))}::jsonb, ${JSON.stringify(textList(body.includesEn))}::jsonb,
          ${String(body.meetingPoint || 'Kulino House, Banyuwangi').trim()}, ${body.published !== false}
        FROM tour_categories WHERE id = ${categoryId}
        RETURNING *
      `;
      if (!rows.length) return NextResponse.json({ error: 'Kategori tour tidak ditemukan.' }, { status: 404, headers: noStore });
      const category = await sql`SELECT name FROM tour_categories WHERE id = ${categoryId}`;
      return NextResponse.json(tourRow({ ...rows[0], category_name: category[0].name }), { status: 201, headers: noStore });
    }

    return NextResponse.json({ error: 'Tipe data tidak valid.' }, { status: 400, headers: noStore });
  } catch (error) {
    console.error('POST /api/admin/tours error:', error);
    return NextResponse.json({ error: 'Data tour gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
