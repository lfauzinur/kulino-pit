import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';

const sql = neon(process.env.DATABASE_URL);

async function getBikeId(params) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

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

// PUT /api/bikes/[id] → update SEMUA field langsung (no COALESCE trick)
export async function PUT(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = await getBikeId(params);
    if (!id) {
      return NextResponse.json({ error: 'Invalid bike ID' }, { status: 400 });
    }

    const body = await request.json();

    // Ambil data lama dulu sebagai fallback
    const current = await sql`SELECT * FROM bikes WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    const cur = current[0];

    // Merge: pakai nilai baru kalau ada, fallback ke nilai lama
    const name        = body.name        ?? cur.name;
    const category    = body.category    ?? cur.category;
    const image       = (body.image && body.image.trim() !== '') ? body.image : cur.image;
    const imagePublicId = body.imagePublicId ?? cur.image_public_id;
    const frameSizeArr  = Array.isArray(body.frameSize) ? body.frameSize : (cur.frame_size || ['M']);
    const pricePerDay = body.pricePerDay  ?? cur.price_per_day;
    const price2h     = body.price2h      ?? cur.price_2h;
    const price3h     = body.price3h      ?? cur.price_3h;
    const price4h     = body.price4h      ?? cur.price_4h;
    const price6h     = body.price6h      ?? cur.price_6h;
    const popular     = typeof body.popular   === 'boolean' ? body.popular   : cur.popular;
    const available   = typeof body.available === 'boolean' ? body.available : cur.available;
    const descId      = body.description?.id  ?? cur.description_id;
    const descEn      = body.description?.en  ?? cur.description_en;
    const specWeight  = body.specs?.weight    ?? cur.spec_weight;
    const specGroup   = body.specs?.groupset  ?? cur.spec_groupset;
    const specBrake   = body.specs?.brake     ?? cur.spec_brake;
    const specWheel   = body.specs?.wheel     ?? cur.spec_wheel;

    const rows = await sql`
      UPDATE bikes SET
        name          = ${name},
        category      = ${category},
        image         = ${image},
        image_public_id = ${imagePublicId},
        frame_size    = ${JSON.stringify(frameSizeArr)}::jsonb,
        price_per_day = ${pricePerDay},
        price_2h      = ${price2h},
        price_3h      = ${price3h},
        price_4h      = ${price4h},
        price_6h      = ${price6h},
        popular       = ${popular},
        available     = ${available},
        description_id  = ${descId},
        description_en  = ${descEn},
        spec_weight   = ${specWeight},
        spec_groupset = ${specGroup},
        spec_brake    = ${specBrake},
        spec_wheel    = ${specWheel},
        updated_at    = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(rowToBike(rows[0]));
  } catch (error) {
    console.error('PUT /api/bikes/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/bikes/[id] → hapus sepeda
export async function DELETE(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = await getBikeId(params);
    if (!id) {
      return NextResponse.json({ error: 'Invalid bike ID' }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM bikes
      WHERE id = ${id}
      RETURNING id
    `;
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/bikes/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
