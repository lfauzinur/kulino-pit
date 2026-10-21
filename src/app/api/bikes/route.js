import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';

const sql = neon(process.env.DATABASE_URL);

export const dynamic = 'force-dynamic';

const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
};

// Helper: transform DB row → app bike object
function rowToBike(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    image: row.image,
    imagePublicId: row.image_public_id,
    frameSize: Array.isArray(row.frame_size) ? row.frame_size : (row.frame_size ? JSON.parse(row.frame_size) : ['M']),
    pricePerDay: row.price_per_day,
    price2h: row.price_2h,
    price3h: row.price_3h,
    price4h: row.price_4h,
    price6h: row.price_6h,
    popular: row.popular,
    available: row.available,
    description: { id: row.description_id, en: row.description_en },
    specs: {
      weight: row.spec_weight,
      groupset: row.spec_groupset,
      brake: row.spec_brake,
      wheel: row.spec_wheel,
    },
  };
}

// GET /api/bikes → semua sepeda
export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM bikes ORDER BY sort_order ASC, id ASC
    `;
    return NextResponse.json(rows.map(rowToBike), { headers: noStoreHeaders });
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
    const body = await request.json();
    const {
      name, category = 'city', image = '/images/bikes/roadbike.png',
      imagePublicId, frameSize = ['M'],
      pricePerDay = 0, price2h = 0, price3h = 0, price4h = 0, price6h = 0,
      popular = false, available = true,
      description = {}, specs = {},
    } = body;

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    // Ambil sort_order max
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) as max FROM bikes`;
    const sortOrder = parseInt(maxOrder[0].max) + 1;

    const rows = await sql`
      INSERT INTO bikes (
        name, category, image, image_public_id, frame_size,
        price_per_day, price_2h, price_3h, price_4h, price_6h,
        popular, available,
        description_id, description_en,
        spec_weight, spec_groupset, spec_brake, spec_wheel,
        sort_order
      ) VALUES (
        ${name}, ${category}, ${image}, ${imagePublicId || null}, ${JSON.stringify(frameSize)}::jsonb,
        ${pricePerDay}, ${price2h}, ${price3h}, ${price4h}, ${price6h},
        ${popular}, ${available},
        ${description.id || ''}, ${description.en || ''},
        ${specs.weight || ''}, ${specs.groupset || ''}, ${specs.brake || ''}, ${specs.wheel || ''},
        ${sortOrder}
      ) RETURNING *
    `;
    return NextResponse.json(rowToBike(rows[0]), { status: 201 });
  } catch (error) {
    console.error('POST /api/bikes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
