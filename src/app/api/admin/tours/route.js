import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function categoryRow(row) {
  return { id: Number(row.id), name: row.name };
}

function tourRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    categoryId: Number(row.category_id),
    category: row.category_name,
    duration: row.duration,
  };
}

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
      const price = Number(body.price);
      const categoryId = Number(body.categoryId);
      if (!name || !duration || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(categoryId)) {
        return NextResponse.json({ error: 'Nama, kategori, harga, dan durasi wajib valid.' }, { status: 400, headers: noStore });
      }
      const existing = await sql`SELECT id FROM tour_packages WHERE LOWER(name) = LOWER(${name}) LIMIT 1`;
      if (existing.length) return NextResponse.json({ error: 'Paket tour dengan nama tersebut sudah ada.' }, { status: 409, headers: noStore });
      const rows = await sql`
        INSERT INTO tour_packages (name, price, category_id, duration)
        SELECT ${name}, ${price}, id, ${duration} FROM tour_categories WHERE id = ${categoryId}
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
