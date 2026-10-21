import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, partnerRow, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const rows = await sql`SELECT * FROM partner_applications ORDER BY created_at DESC`;
    return NextResponse.json(rows.map(partnerRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/partners error:', error);
    return NextResponse.json({ error: 'Gagal memuat pendaftaran mitra.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || body.whatsapp || '').trim();
    const city = String(body.city || body.location || '').trim();
    const bikeName = String(body.bikeName || body.bikeType || '').trim();
    if (!name || !phone || !city || !bikeName) {
      return NextResponse.json({ error: 'Nama, WhatsApp, lokasi, dan tipe sepeda wajib diisi.' }, { status: 400 });
    }
    const code = `PR-${Date.now().toString().slice(-8)}`;
    const rows = await sql`
      INSERT INTO partner_applications (
        application_code, name, phone, email, city, address, bike_name, bike_brand,
        bike_category, bike_condition, bike_year, bike_color, bike_frame, bike_groupset,
        bike_brake, bike_wheel, notes, join_reason, id_card, photo_url
      ) VALUES (
        ${code}, ${name}, ${phone}, ${String(body.email || '')}, ${city}, ${String(body.address || '')},
        ${bikeName}, ${String(body.bikeBrand || '')}, ${String(body.category || '')},
        ${String(body.condition || 'Baik')}, ${String(body.bikeYear || '')}, ${String(body.bikeColor || '')},
        ${String(body.bikeSize || body.bikeFrame || '')}, ${String(body.bikeGroupset || '')},
        ${String(body.bikeBrake || '')}, ${String(body.bikeWheel || '')}, ${String(body.notes || '')},
        ${String(body.joinReason || '')}, ${String(body.idCard || '')}, ${String(body.photoUrl || '')}
      ) RETURNING *
    `;
    return NextResponse.json(partnerRow(rows[0]), { status: 201 });
  } catch (error) {
    console.error('POST /api/partners error:', error);
    return NextResponse.json({ error: 'Pendaftaran mitra gagal disimpan.' }, { status: 500 });
  }
}
