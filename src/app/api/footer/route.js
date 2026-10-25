import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, footerItemRow, sql } from '@/lib/app-database';
import { footerDefaults, mergeFooterSettings } from '@/lib/footer-defaults';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const groups = new Set(['navigation', 'help', 'contact', 'social']);

function text(value, fallback = '') { return String(value ?? fallback).trim().slice(0, 1000); }
function locale(value, fallback) { return { id: text(value?.id, fallback.id), en: text(value?.en, value?.id || fallback.en) }; }
function cleanSettings(body) {
  const source = mergeFooterSettings(body);
  return {
    brandName: text(source.brandName, footerDefaults.brandName),
    tagline: text(source.tagline, footerDefaults.tagline),
    description: locale(source.description, footerDefaults.description),
    showCta: source.showCta !== false,
    ctaTitle: locale(source.ctaTitle, footerDefaults.ctaTitle),
    ctaDescription: locale(source.ctaDescription, footerDefaults.ctaDescription),
    ctaButton: locale(source.ctaButton, footerDefaults.ctaButton),
    ctaUrl: text(source.ctaUrl, footerDefaults.ctaUrl),
    sectionTitles: {
      navigation: locale(source.sectionTitles?.navigation, footerDefaults.sectionTitles.navigation),
      help: locale(source.sectionTitles?.help, footerDefaults.sectionTitles.help),
      contact: locale(source.sectionTitles?.contact, footerDefaults.sectionTitles.contact),
    },
    copyright: text(source.copyright, footerDefaults.copyright),
    madeWith: locale(source.madeWith, footerDefaults.madeWith),
  };
}

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const all = request.nextUrl.searchParams.get('all') === '1' && await requireAdminSession();
    const [settingsRows, itemRows] = await Promise.all([
      sql`SELECT value FROM app_settings WHERE key = 'footer_settings_v1' LIMIT 1`,
      all
        ? sql`SELECT * FROM footer_items ORDER BY group_key, sort_order, id`
        : sql`SELECT * FROM footer_items WHERE published = true ORDER BY group_key, sort_order, id`,
    ]);
    return NextResponse.json({ settings: mergeFooterSettings(settingsRows[0]?.value), items: itemRows.map(footerItemRow) }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/footer error:', error);
    return NextResponse.json({ error: 'Footer gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function PUT(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const settings = cleanSettings(await request.json());
    await sql`INSERT INTO app_settings (key, value, updated_at) VALUES ('footer_settings_v1', ${JSON.stringify(settings)}::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
    return NextResponse.json(settings, { headers: noStore });
  } catch (error) {
    console.error('PUT /api/footer error:', error);
    return NextResponse.json({ error: 'Pengaturan footer gagal disimpan.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const group = text(body.group);
    const labelId = text(body.label?.id);
    if (!groups.has(group) || !labelId) return NextResponse.json({ error: 'Bagian dan label Indonesia wajib diisi.' }, { status: 400, headers: noStore });
    const rows = await sql`
      INSERT INTO footer_items (group_key, label_id, label_en, url, icon, sort_order, published)
      VALUES (${group}, ${labelId}, ${text(body.label?.en, labelId)}, ${text(body.url)}, ${text(body.icon, 'link')}, ${Math.round(Number(body.sortOrder) || 0)}, ${body.published !== false}) RETURNING *
    `;
    return NextResponse.json(footerItemRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/footer error:', error);
    return NextResponse.json({ error: 'Item footer gagal ditambahkan.' }, { status: 500, headers: noStore });
  }
}

