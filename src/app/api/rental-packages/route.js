import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, rentalPackageRow, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const types = new Set(['family', 'corporate']);

function cleanPhone(value) {
  let phone = String(value || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
  return phone;
}

function payload(body) {
  const type = String(body.type || '');
  const name = String(body.name || '').trim();
  if (!types.has(type) || !name) throw new Error('Jenis dan nama paket wajib diisi.');
  const features = Array.isArray(body.features)
    ? body.features.map((item) => String(item).trim()).filter(Boolean).slice(0, 30)
    : [];
  return {
    type,
    name,
    persons: String(body.persons || '').trim(),
    bikes: String(body.bikes || '').trim(),
    duration: String(body.duration || '').trim(),
    price: String(body.price || '').trim(),
    features,
    popular: body.popular === true,
    whatsappNumber: cleanPhone(body.whatsappNumber),
    whatsappLabel: String(body.whatsappLabel || 'Pesan via WhatsApp').trim(),
    whatsappMessage: String(body.whatsappMessage || '').trim(),
    sortOrder: Math.round(Number(body.sortOrder) || 0),
    published: body.published !== false,
  };
}

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const type = request.nextUrl.searchParams.get('type') || '';
    if (!types.has(type)) return NextResponse.json({ error: 'Jenis paket tidak valid.' }, { status: 400, headers: noStore });
    const isAdmin = await requireAdminSession();
    const all = request.nextUrl.searchParams.get('all') === '1' && isAdmin;
    const rows = all
      ? await sql`SELECT * FROM rental_packages WHERE package_type = ${type} ORDER BY sort_order, id`
      : await sql`SELECT * FROM rental_packages WHERE package_type = ${type} AND published = true ORDER BY sort_order, id`;
    return NextResponse.json(rows.map(rentalPackageRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/rental-packages error:', error);
    return NextResponse.json({ error: 'Paket rental gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const item = payload(await request.json());
    if (item.popular) await sql`UPDATE rental_packages SET popular = false WHERE package_type = ${item.type}`;
    const rows = await sql`
      INSERT INTO rental_packages (package_type, name, persons, bikes, duration, price_label, features, popular, whatsapp_number, whatsapp_label, whatsapp_message, sort_order, published)
      VALUES (${item.type}, ${item.name}, ${item.persons}, ${item.bikes}, ${item.duration}, ${item.price}, ${JSON.stringify(item.features)}::jsonb, ${item.popular}, ${item.whatsappNumber}, ${item.whatsappLabel}, ${item.whatsappMessage}, ${item.sortOrder}, ${item.published})
      RETURNING *
    `;
    return NextResponse.json(rentalPackageRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/rental-packages error:', error);
    const duplicate = error?.code === '23505';
    return NextResponse.json({ error: duplicate ? 'Nama paket sudah digunakan.' : error.message || 'Paket gagal disimpan.' }, { status: duplicate ? 409 : 400, headers: noStore });
  }
}
