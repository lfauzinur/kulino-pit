import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

const publicPages = [
  { id: 'homepage', name: 'Beranda', path: '/', category: 'Halaman Utama' },
  { id: 'tentang', name: 'Tentang Kami', path: '/tentang', category: 'Halaman Info' },
  { id: 'unit-sepeda', name: 'Unit Sepeda', path: '/unit-sepeda', category: 'Katalog' },
  { id: 'layanan', name: 'Layanan', path: '/layanan', category: 'Halaman Info' },
  { id: 'trip-tour', name: 'Trip & Tour', path: '/trip-tour', category: 'Katalog' },
  { id: 'artikel', name: 'Artikel', path: '/artikel', category: 'Konten' },
  { id: 'faq', name: 'FAQ', path: '/faq', category: 'Halaman Info' },
  { id: 'jadi-mitra', name: 'Jadi Mitra', path: '/jadi-mitra', category: 'Formulir' },
  { id: 'routes', name: 'Rute Gowes', path: '/routes', category: 'Katalog' },
  { id: 'booking', name: 'Booking', path: '/booking', category: 'Formulir' },
  { id: 'member', name: 'Member Portal', path: '/member', category: 'Portal' },
  { id: 'kebijakan-privasi', name: 'Kebijakan Privasi', path: '/kebijakan-privasi', category: 'Legal' },
  { id: 'syarat-ketentuan', name: 'Syarat & Ketentuan', path: '/syarat-ketentuan', category: 'Legal' },
  { id: 'lokasi', name: 'Lokasi', path: '/lokasi', category: 'Halaman Info' },
];

function hasMeta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.some((tag) => {
    const keyMatch = tag.match(new RegExp(`${key}=["']([^"']+)["']`, 'i'));
    const contentMatch = tag.match(/content=["']([^"']+)["']/i);
    return keyMatch?.[1]?.toLowerCase() === value.toLowerCase() && Boolean(contentMatch?.[1]?.trim());
  });
}

async function inspectPage(baseUrl, page) {
  try {
    const response = await fetch(new URL(page.path, baseUrl), {
      cache: 'no-store',
      headers: { 'User-Agent': 'Kulino-Pit-CMS-Audit/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();
    const checks = {
      title: /<title[^>]*>\s*[^<]+\s*<\/title>/i.test(html),
      meta: hasMeta(html, 'name', 'description'),
      h1: /<h1\b[^>]*>/i.test(html),
      og: hasMeta(html, 'property', 'og:title'),
      schema: /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html),
    };
    const score = Object.values(checks).filter(Boolean).length * 20;
    return {
      ...page,
      reachable: response.ok,
      statusCode: response.status,
      score,
      checks,
      sections: (html.match(/<section\b/gi) || []).length,
      headings: (html.match(/<h[1-3]\b/gi) || []).length,
    };
  } catch (error) {
    return {
      ...page,
      reachable: false,
      statusCode: 0,
      score: 0,
      checks: { title: false, meta: false, h1: false, og: false, schema: false },
      sections: 0,
      headings: 0,
      error: error.name === 'TimeoutError' ? 'Pemeriksaan timeout' : 'Halaman tidak dapat diperiksa',
    };
  }
}

function eventTimestamp(row) {
  return row.updated_at ? new Date(row.updated_at).toISOString() : null;
}

export async function GET(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    const baseUrl = productionHost ? `https://${productionHost}` : request.nextUrl.origin;

    const [audits, counts, bookingEvents, partnerEvents, articleEvents, bikeEvents] = await Promise.all([
      Promise.all(publicPages.map((page) => inspectPage(baseUrl, page))),
      sql`
        SELECT
          (SELECT COUNT(*) FROM bikes)::int AS bikes,
          (SELECT COUNT(*) FROM bookings)::int AS bookings,
          (SELECT COUNT(*) FROM partner_applications)::int AS partners,
          (SELECT COUNT(*) FROM articles)::int AS articles,
          (SELECT COUNT(*) FROM bookings WHERE status IN ('Active', 'Completed'))::int AS paid_bookings,
          (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status IN ('Active', 'Completed'))::bigint AS revenue
      `,
      sql`SELECT id, booking_code, customer_name, status, updated_at FROM bookings ORDER BY updated_at DESC LIMIT 8`,
      sql`SELECT id, application_code, name, status, updated_at FROM partner_applications ORDER BY updated_at DESC LIMIT 8`,
      sql`SELECT id, slug, title_id, status, updated_at FROM articles ORDER BY updated_at DESC LIMIT 8`,
      sql`SELECT id, name, available, updated_at FROM bikes ORDER BY updated_at DESC NULLS LAST LIMIT 8`,
    ]);

    const logs = [
      ...bookingEvents.map((row) => ({
        id: `booking-${row.id}`,
        type: 'booking',
        title: `Booking ${row.booking_code}`,
        detail: `${row.customer_name} · ${row.status}`,
        timestamp: eventTimestamp(row),
      })),
      ...partnerEvents.map((row) => ({
        id: `partner-${row.id}`,
        type: 'partner',
        title: `Mitra ${row.application_code}`,
        detail: `${row.name} · ${row.status}`,
        timestamp: eventTimestamp(row),
      })),
      ...articleEvents.map((row) => ({
        id: `article-${row.id}`,
        type: 'article',
        title: `Artikel ${row.slug}`,
        detail: `${row.title_id} · ${row.status}`,
        timestamp: eventTimestamp(row),
      })),
      ...bikeEvents.map((row) => ({
        id: `bike-${row.id}`,
        type: 'bike',
        title: `Unit ${row.name}`,
        detail: row.available ? 'Tersedia' : 'Tidak tersedia',
        timestamp: eventTimestamp(row),
      })),
    ].filter((event) => event.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    const count = counts[0];
    const reachable = audits.filter((page) => page.reachable).length;
    const averageSeo = audits.length
      ? Math.round(audits.reduce((sum, page) => sum + page.score, 0) / audits.length)
      : 0;

    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      baseUrl,
      stats: {
        pages: audits.length,
        reachable,
        averageSeo,
        bikes: Number(count.bikes),
        bookings: Number(count.bookings),
        partners: Number(count.partners),
        articles: Number(count.articles),
        paidBookings: Number(count.paid_bookings),
        revenue: Number(count.revenue),
      },
      pages: audits,
      logs,
    }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/cms-audit error:', error);
    return NextResponse.json({ error: 'Audit CMS gagal dijalankan.' }, { status: 500, headers: noStore });
  }
}
