import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL);

function rowToBike(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    image: row.image,
    imagePublicId: row.image_public_id,
    frameSize: row.frame_size || ['M'],
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

// PUT /api/bikes/[id] → update sepeda
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      name, category, image, imagePublicId, frameSize,
      pricePerDay, price2h, price3h, price4h, price6h,
      popular, available, description = {}, specs = {},
    } = body;

    const rows = await sql`
      UPDATE bikes SET
        name = COALESCE(${name}, name),
        category = COALESCE(${category}, category),
        image = COALESCE(${image}, image),
        image_public_id = COALESCE(${imagePublicId || null}, image_public_id),
        frame_size = COALESCE(${frameSize ? JSON.stringify(frameSize) : null}, frame_size),
        price_per_day = COALESCE(${pricePerDay}, price_per_day),
        price_2h = COALESCE(${price2h}, price_2h),
        price_3h = COALESCE(${price3h}, price_3h),
        price_4h = COALESCE(${price4h}, price_4h),
        price_6h = COALESCE(${price6h}, price_6h),
        popular = COALESCE(${typeof popular === 'boolean' ? popular : null}, popular),
        available = COALESCE(${typeof available === 'boolean' ? available : null}, available),
        description_id = COALESCE(${description.id ?? null}, description_id),
        description_en = COALESCE(${description.en ?? null}, description_en),
        spec_weight = COALESCE(${specs.weight ?? null}, spec_weight),
        spec_groupset = COALESCE(${specs.groupset ?? null}, spec_groupset),
        spec_brake = COALESCE(${specs.brake ?? null}, spec_brake),
        spec_wheel = COALESCE(${specs.wheel ?? null}, spec_wheel),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json(rowToBike(rows[0]));
  } catch (error) {
    console.error('PUT /api/bikes/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/bikes/[id] → hapus sepeda
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    // Ambil publicId untuk hapus dari Cloudinary juga
    const bike = await sql`SELECT image_public_id FROM bikes WHERE id = ${id}`;
    if (bike.length === 0) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    await sql`DELETE FROM bikes WHERE id = ${id}`;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/bikes/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
