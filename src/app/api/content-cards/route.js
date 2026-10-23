import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { contentCardRow, ensureAppDatabase, sql } from '@/lib/app-database';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const sections = new Set(['corporate_benefits', 'manpower_roles']);

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const section = request.nextUrl.searchParams.get('section') || '';
    if (!sections.has(section)) return NextResponse.json({ error: 'Bagian konten tidak valid.' }, { status: 400, headers: noStore });
    const isAdmin = await requireAdminSession();
    const all = request.nextUrl.searchParams.get('all') === '1' && isAdmin;
    const rows = all
      ? await sql`SELECT * FROM content_cards WHERE section_key = ${section} ORDER BY sort_order, id`
      : await sql`SELECT * FROM content_cards WHERE section_key = ${section} AND published = true ORDER BY sort_order, id`;
    return NextResponse.json(rows.map(contentCardRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/content-cards error:', error);
    return NextResponse.json({ error: 'Konten kartu gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const section = String(body.section || '');
    const titleId = String(body.title?.id || '').trim();
    if (!sections.has(section) || !titleId) return NextResponse.json({ error: 'Bagian dan judul wajib diisi.' }, { status: 400, headers: noStore });
    const rows = await sql`
      INSERT INTO content_cards (section_key, title_id, title_en, description_id, description_en, icon, accent_color, sort_order, published)
      VALUES (${section}, ${titleId}, ${String(body.title?.en || titleId)}, ${String(body.description?.id || '')}, ${String(body.description?.en || body.description?.id || '')}, ${String(body.icon || 'users')}, ${String(body.accentColor || '#3B82F6')}, ${Math.round(Number(body.sortOrder) || 0)}, ${body.published !== false})
      RETURNING *
    `;
    return NextResponse.json(contentCardRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/content-cards error:', error);
    return NextResponse.json({ error: error?.code === '23505' ? 'Judul sudah digunakan pada bagian ini.' : 'Konten gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
