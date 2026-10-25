import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, footerItemRow, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const groups = new Set(['navigation', 'help', 'contact', 'social']);
const text = (value, fallback = '') => String(value ?? fallback).trim().slice(0, 1000);
async function itemId(params) { const { id } = await params; const value = Number(id); return Number.isSafeInteger(value) && value > 0 ? value : null; }

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await itemId(params); const body = await request.json(); const group = text(body.group); const labelId = text(body.label?.id);
    if (!id || !groups.has(group) || !labelId) return NextResponse.json({ error: 'Data item footer tidak valid.' }, { status: 400, headers: noStore });
    const rows = await sql`
      UPDATE footer_items SET group_key = ${group}, label_id = ${labelId}, label_en = ${text(body.label?.en, labelId)}, url = ${text(body.url)}, icon = ${text(body.icon, 'link')}, sort_order = ${Math.round(Number(body.sortOrder) || 0)}, published = ${body.published !== false}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Item footer tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(footerItemRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/footer/[id] error:', error);
    return NextResponse.json({ error: 'Item footer gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  await ensureAppDatabase();
  const id = await itemId(params);
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
  const rows = await sql`DELETE FROM footer_items WHERE id = ${id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: 'Item footer tidak ditemukan.' }, { status: 404, headers: noStore });
  return NextResponse.json({ success: true }, { headers: noStore });
}
