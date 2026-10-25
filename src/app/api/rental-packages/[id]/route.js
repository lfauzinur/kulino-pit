import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, rentalPackageRow, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const types = new Set(['family', 'corporate']);

async function idFrom(params) {
  const { id } = await params;
  const value = Number(id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function cleanPhone(value) {
  let phone = String(value || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
  return phone;
}

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await idFrom(params);
    const body = await request.json();
    const type = String(body.type || '');
    const name = String(body.name || '').trim();
    if (!id || !types.has(type) || !name) return NextResponse.json({ error: 'Data paket tidak valid.' }, { status: 400, headers: noStore });
    const features = Array.isArray(body.features) ? body.features.map((item) => String(item).trim()).filter(Boolean).slice(0, 30) : [];
    if (body.popular === true) await sql`UPDATE rental_packages SET popular = false WHERE package_type = ${type} AND id <> ${id}`;
    const rows = await sql`
      UPDATE rental_packages SET
        package_type = ${type}, name = ${name}, persons = ${String(body.persons || '').trim()},
        bikes = ${String(body.bikes || '').trim()}, duration = ${String(body.duration || '').trim()},
        price_label = ${String(body.price || '').trim()}, features = ${JSON.stringify(features)}::jsonb,
        popular = ${body.popular === true}, whatsapp_number = ${cleanPhone(body.whatsappNumber)},
        whatsapp_label = ${String(body.whatsappLabel || 'Pesan via WhatsApp').trim()},
        whatsapp_message = ${String(body.whatsappMessage || '').trim()}, sort_order = ${Math.round(Number(body.sortOrder) || 0)},
        published = ${body.published !== false}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Paket tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(rentalPackageRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/rental-packages/[id] error:', error);
    return NextResponse.json({ error: error?.code === '23505' ? 'Nama paket sudah digunakan.' : 'Paket gagal diperbarui.' }, { status: error?.code === '23505' ? 409 : 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  await ensureAppDatabase();
  const id = await idFrom(params);
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
  const rows = await sql`DELETE FROM rental_packages WHERE id = ${id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: 'Paket tidak ditemukan.' }, { status: 404, headers: noStore });
  return NextResponse.json({ success: true }, { headers: noStore });
}
