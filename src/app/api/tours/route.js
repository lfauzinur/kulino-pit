import { NextResponse } from 'next/server';
import { ensureAppDatabase, sql, tourRow } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const slug = request.nextUrl.searchParams.get('slug');
    const rows = slug
      ? await sql`
          SELECT p.*, c.name AS category_name FROM tour_packages p
          JOIN tour_categories c ON c.id = p.category_id
          WHERE p.slug = ${slug} AND p.published = true LIMIT 1
        `
      : await sql`
          SELECT p.*, c.name AS category_name FROM tour_packages p
          JOIN tour_categories c ON c.id = p.category_id
          WHERE p.published = true
          ORDER BY p.created_at ASC, p.id ASC
        `;
    if (slug && !rows.length) return NextResponse.json({ error: 'Tour tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(slug ? tourRow(rows[0]) : rows.map(tourRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/tours error:', error);
    return NextResponse.json({ error: 'Data tour gagal dimuat.' }, { status: 500, headers: noStore });
  }
}
