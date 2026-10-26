import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, promoBannerRow, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const kinds = new Set(['promo', 'program']);
const colorPattern = /^#[0-9a-f]{6}$/i;

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanUrl(value) {
  const url = cleanText(value, 1500);
  if (!url) return '';
  if (url.startsWith('/') || /^https?:\/\//i.test(url)) return url;
  throw new Error('Tautan tombol harus diawali /, http://, atau https://.');
}

function payload(body) {
  const kind = cleanText(body.kind, 20);
  const titleId = cleanText(body.title?.id, 180);
  if (!kinds.has(kind) || !titleId) throw new Error('Jenis dan judul Indonesia wajib diisi.');

  return {
    kind,
    badgeId: cleanText(body.badge?.id, 80),
    badgeEn: cleanText(body.badge?.en, 80),
    titleId,
    titleEn: cleanText(body.title?.en, 180),
    descriptionId: cleanText(body.description?.id, 500),
    descriptionEn: cleanText(body.description?.en, 500),
    ctaLabelId: cleanText(body.ctaLabel?.id, 80),
    ctaLabelEn: cleanText(body.ctaLabel?.en, 80),
    ctaUrl: cleanUrl(body.ctaUrl),
    backgroundColor: colorPattern.test(body.backgroundColor || '') ? body.backgroundColor : '#2693D8',
    textColor: colorPattern.test(body.textColor || '') ? body.textColor : '#FFFFFF',
    imageUrl: cleanText(body.imageUrl, 1500),
    imagePublicId: cleanText(body.imagePublicId, 500),
    sortOrder: Math.round(Number(body.sortOrder) || 0),
    published: body.published !== false,
  };
}

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const isAdmin = await requireAdminSession();
    const includeAll = request.nextUrl.searchParams.get('all') === '1' && isAdmin;
    const rows = includeAll
      ? await sql`SELECT * FROM promo_banners ORDER BY sort_order, id`
      : await sql`SELECT * FROM promo_banners WHERE published = true ORDER BY sort_order, id`;
    return NextResponse.json(rows.map(promoBannerRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/banners error:', error);
    return NextResponse.json({ error: 'Banner gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const item = payload(await request.json());
    const rows = await sql`
      INSERT INTO promo_banners (
        kind, badge_id, badge_en, title_id, title_en, description_id, description_en,
        cta_label_id, cta_label_en, cta_url, background_color, text_color,
        image_url, image_public_id, sort_order, published
      ) VALUES (
        ${item.kind}, ${item.badgeId}, ${item.badgeEn}, ${item.titleId}, ${item.titleEn},
        ${item.descriptionId}, ${item.descriptionEn}, ${item.ctaLabelId}, ${item.ctaLabelEn},
        ${item.ctaUrl}, ${item.backgroundColor}, ${item.textColor}, ${item.imageUrl},
        ${item.imagePublicId || null}, ${item.sortOrder}, ${item.published}
      ) RETURNING *
    `;
    return NextResponse.json(promoBannerRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/banners error:', error);
    const duplicate = error?.code === '23505';
    return NextResponse.json({ error: duplicate ? 'Judul banner sudah digunakan.' : error.message || 'Banner gagal disimpan.' }, { status: duplicate ? 409 : 400, headers: noStore });
  }
}
