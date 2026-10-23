import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, serviceRow, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const textList = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
async function getId(params) { const { id } = await params; const value = Number(id); return Number.isSafeInteger(value) && value > 0 ? value : null; }

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    const body = await request.json();
    const titleId = String(body.titleId || '').trim();
    const descriptionId = String(body.descriptionId || '').trim();
    if (!id || !titleId || !descriptionId) return NextResponse.json({ error: 'Data layanan tidak valid.' }, { status: 400, headers: noStore });
    const rows = await sql`
      UPDATE services SET
        title_id = ${titleId}, title_en = ${String(body.titleEn || titleId).trim()},
        description_id = ${descriptionId}, description_en = ${String(body.descriptionEn || descriptionId).trim()},
        features_id = ${JSON.stringify(textList(body.featuresId))}::jsonb,
        features_en = ${JSON.stringify(textList(body.featuresEn))}::jsonb,
        price_label = ${String(body.priceLabel || '').trim()}, icon = ${String(body.icon || 'camera')},
        accent_color = ${String(body.accentColor || '#3B82F6')},
        sort_order = ${Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0},
        published = ${body.published !== false}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Layanan tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(serviceRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/services/[id] error:', error);
    return NextResponse.json({ error: 'Layanan gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
    const rows = await sql`DELETE FROM services WHERE id = ${id} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Layanan tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/services/[id] error:', error);
    return NextResponse.json({ error: 'Layanan gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
