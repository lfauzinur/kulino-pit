import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { contentCardRow, ensureAppDatabase, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
async function idFrom(params) { const { id } = await params; const value = Number(id); return Number.isSafeInteger(value) && value > 0 ? value : null; }

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await idFrom(params); const body = await request.json(); const titleId = String(body.title?.id || '').trim();
    if (!id || !titleId) return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400, headers: noStore });
    const rows = await sql`
      UPDATE content_cards SET title_id = ${titleId}, title_en = ${String(body.title?.en || titleId)}, description_id = ${String(body.description?.id || '')}, description_en = ${String(body.description?.en || body.description?.id || '')}, icon = ${String(body.icon || 'users')}, accent_color = ${String(body.accentColor || '#3B82F6')}, sort_order = ${Math.round(Number(body.sortOrder) || 0)}, published = ${body.published !== false}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(contentCardRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/content-cards/[id] error:', error);
    return NextResponse.json({ error: 'Konten gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  await ensureAppDatabase();
  const id = await idFrom(params);
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
  const rows = await sql`DELETE FROM content_cards WHERE id = ${id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404, headers: noStore });
  return NextResponse.json({ success: true }, { headers: noStore });
}
