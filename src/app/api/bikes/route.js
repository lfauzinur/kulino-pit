import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { bikeRow, ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';

const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
};

// GET /api/bikes → semua sepeda
export async function GET() {
  try {
    await ensureAppDatabase();
    const rows = await sql`
      SELECT b.*, COUNT(bookings.id) FILTER (WHERE bookings.status = 'Active')::int AS active_count
      FROM bikes b
      LEFT JOIN bookings ON bookings.bike_id = b.id
      GROUP BY b.id
      ORDER BY b.sort_order ASC, b.id ASC
    `;
    return NextResponse.json(rows.map(bikeRow), { headers: noStoreHeaders });
  } catch (error) {
    console.error('GET /api/bikes error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

// POST /api/bikes → tambah sepeda baru
export async function POST(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureAppDatabase();
    const body = await request.json();
    const {
      name, category = 'city', image = '/images/bikes/roadbike.png',
      imagePublicId, frameSize = ['M'],
      pricePerDay = 0, price2h = 0, price3h = 0, price4h = 0, price6h = 0,
      popular = false, available = true,
      stockCount = 1,
      description = {}, specs = {},
    } = body;

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const normalizedStock = Number(stockCount);
    if (!Number.isSafeInteger(normalizedStock) || normalizedStock < 0) {
      return NextResponse.json({ error: 'Jumlah stok harus berupa bilangan bulat minimal 0.' }, { status: 400, headers: noStoreHeaders });
    }

    // Ambil sort_order max
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) as max FROM bikes`;
    const sortOrder = parseInt(maxOrder[0].max) + 1;

    const inserted = await sql`
      INSERT INTO bikes (
        name, category, image, image_public_id, frame_size,
        price_per_day, price_2h, price_3h, price_4h, price_6h,
        popular, available, stock_count,
        description_id, description_en,
        spec_weight, spec_groupset, spec_brake, spec_wheel,
        sort_order
      ) VALUES (
        ${name}, ${category}, ${image}, ${imagePublicId || null}, ${JSON.stringify(frameSize)}::jsonb,
        ${pricePerDay}, ${price2h}, ${price3h}, ${price4h}, ${price6h},
        ${popular}, ${available}, ${normalizedStock},
        ${description.id || ''}, ${description.en || ''},
        ${specs.weight || ''}, ${specs.groupset || ''}, ${specs.brake || ''}, ${specs.wheel || ''},
        ${sortOrder}
      ) RETURNING id
    `;
    const rows = await sql`SELECT b.*, 0::int AS active_count FROM bikes b WHERE b.id = ${inserted[0].id}`;
    return NextResponse.json(bikeRow(rows[0]), { status: 201, headers: noStoreHeaders });
  } catch (error) {
    console.error('POST /api/bikes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
