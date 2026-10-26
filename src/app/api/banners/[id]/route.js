import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, promoBannerRow, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const kinds = new Set(['promo', 'program']);
const colorPattern = /^#[0-9a-f]{6}$/i;

async function bannerId(params) {
  const { id } = await params;
  const value = Number(id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function text(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function url(value) {
  const result = text(value, 1500);
  if (!result || result.startsWith('/') || /^https?:\/\//i.test(result)) return result;
  throw new Error('Tautan tombol harus diawali /, http://, atau https://.');
}

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await bannerId(params);
    const body = await request.json();
    const kind = text(body.kind, 20);
    const titleId = text(body.title?.id, 180);
    if (!id || !kinds.has(kind) || !titleId) return NextResponse.json({ error: 'Data banner tidak valid.' }, { status: 400, headers: noStore });
    const backgroundColor = colorPattern.test(body.backgroundColor || '') ? body.backgroundColor : '#2693D8';
    const textColor = colorPattern.test(body.textColor || '') ? body.textColor : '#FFFFFF';
    const rows = await sql`
      UPDATE promo_banners SET
        kind = ${kind}, badge_id = ${text(body.badge?.id, 80)}, badge_en = ${text(body.badge?.en, 80)},
        title_id = ${titleId}, title_en = ${text(body.title?.en, 180)},
        description_id = ${text(body.description?.id, 500)}, description_en = ${text(body.description?.en, 500)},
        cta_label_id = ${text(body.ctaLabel?.id, 80)}, cta_label_en = ${text(body.ctaLabel?.en, 80)},
        cta_url = ${url(body.ctaUrl)}, background_color = ${backgroundColor}, text_color = ${textColor},
        image_url = ${text(body.imageUrl, 1500)}, image_public_id = ${text(body.imagePublicId, 500) || null},
        sort_order = ${Math.round(Number(body.sortOrder) || 0)}, published = ${body.published !== false}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(promoBannerRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/banners/[id] error:', error);
    return NextResponse.json({ error: error?.code === '23505' ? 'Judul banner sudah digunakan.' : error.message || 'Banner gagal diperbarui.' }, { status: error?.code === '23505' ? 409 : 400, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  await ensureAppDatabase();
  const id = await bannerId(params);
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
  const rows = await sql`DELETE FROM promo_banners WHERE id = ${id} RETURNING id`;
  if (!rows.length) return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404, headers: noStore });
  return NextResponse.json({ success: true }, { headers: noStore });
}
