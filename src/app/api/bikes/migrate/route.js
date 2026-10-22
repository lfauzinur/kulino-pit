import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

// POST /api/bikes/migrate → import bikes dari JSON (localStorage migration)
export async function POST(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureAppDatabase();
    const { bikes } = await request.json();
    if (!bikes || !Array.isArray(bikes)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = [];
    for (const bike of bikes) {
      const parsedStock = Number(bike.stockCount);
      const stockCount = Number.isSafeInteger(parsedStock) && parsedStock >= 0 ? parsedStock : 1;
      // Cek apakah sudah ada berdasarkan nama
      const existing = await sql`SELECT id FROM bikes WHERE name = ${bike.name} LIMIT 1`;
      
      if (existing.length > 0) {
        // Update data yang ada (terutama foto)
        await sql`
          UPDATE bikes SET
            image = ${bike.image || '/images/bikes/roadbike.png'},
            image_public_id = ${bike.imagePublicId || null},
            category = ${bike.category || 'city'},
            price_per_day = ${bike.pricePerDay || 0},
            price_2h = ${bike.price2h || 0},
            price_3h = ${bike.price3h || 0},
            price_4h = ${bike.price4h || 0},
            price_6h = ${bike.price6h || 0},
            popular = ${bike.popular || false},
            available = ${bike.available !== false},
            stock_count = ${stockCount},
            description_id = ${bike.description?.id || ''},
            description_en = ${bike.description?.en || ''},
            spec_weight = ${bike.specs?.weight || ''},
            spec_groupset = ${bike.specs?.groupset || ''},
            spec_brake = ${bike.specs?.brake || ''},
            spec_wheel = ${bike.specs?.wheel || ''},
            frame_size = ${JSON.stringify(bike.frameSize || ['M'])},
            updated_at = NOW()
          WHERE name = ${bike.name}
        `;
        results.push({ name: bike.name, action: 'updated' });
      } else {
        // Insert baru
        const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) as max FROM bikes`;
        const sortOrder = parseInt(maxOrder[0].max) + 1;
        
        await sql`
          INSERT INTO bikes (
            name, category, image, image_public_id, frame_size,
            price_per_day, price_2h, price_3h, price_4h, price_6h,
            popular, available, stock_count,
            description_id, description_en,
            spec_weight, spec_groupset, spec_brake, spec_wheel,
            sort_order
          ) VALUES (
            ${bike.name}, ${bike.category || 'city'}, ${bike.image || '/images/bikes/roadbike.png'},
            ${bike.imagePublicId || null}, ${JSON.stringify(bike.frameSize || ['M'])},
            ${bike.pricePerDay || 0}, ${bike.price2h || 0}, ${bike.price3h || 0},
            ${bike.price4h || 0}, ${bike.price6h || 0},
            ${bike.popular || false}, ${bike.available !== false}, ${stockCount},
            ${bike.description?.id || ''}, ${bike.description?.en || ''},
            ${bike.specs?.weight || ''}, ${bike.specs?.groupset || ''},
            ${bike.specs?.brake || ''}, ${bike.specs?.wheel || ''},
            ${sortOrder}
          )
        `;
        results.push({ name: bike.name, action: 'inserted' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Migrate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
