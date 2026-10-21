import { NextResponse } from 'next/server';
import { articleRow, ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await ensureAppDatabase();
    const { slug } = await params;
    const rows = await sql`
      SELECT * FROM articles
      WHERE slug = ${decodeURIComponent(slug)} AND status = 'published' AND published_global = true
    `;
    if (!rows.length) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });
    return NextResponse.json(articleRow(rows[0]), { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('GET /api/articles/[slug] error:', error);
    return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 500 });
  }
}
