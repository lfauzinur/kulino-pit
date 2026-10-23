import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, serviceRow, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

const textList = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const isAdmin = await requireAdminSession();
    const includeAll = request.nextUrl.searchParams.get('all') === '1' && isAdmin;
    const rows = includeAll
      ? await sql`SELECT * FROM services ORDER BY sort_order, id`
      : await sql`SELECT * FROM services WHERE published = true ORDER BY sort_order, id`;
    return NextResponse.json(rows.map(serviceRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Layanan gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const titleId = String(body.titleId || '').trim();
    const descriptionId = String(body.descriptionId || '').trim();
    if (!titleId || !descriptionId) return NextResponse.json({ error: 'Nama dan deskripsi layanan wajib diisi.' }, { status: 400, headers: noStore });
    const rows = await sql`
      INSERT INTO services (
        title_id, title_en, description_id, description_en, features_id, features_en,
        price_label, icon, accent_color, sort_order, published
      ) VALUES (
        ${titleId}, ${String(body.titleEn || titleId).trim()}, ${descriptionId},
        ${String(body.descriptionEn || descriptionId).trim()}, ${JSON.stringify(textList(body.featuresId))}::jsonb,
        ${JSON.stringify(textList(body.featuresEn))}::jsonb, ${String(body.priceLabel || '').trim()},
        ${String(body.icon || 'camera')}, ${String(body.accentColor || '#3B82F6')},
        ${Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0}, ${body.published !== false}
      ) RETURNING *
    `;
    return NextResponse.json(serviceRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Layanan gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
