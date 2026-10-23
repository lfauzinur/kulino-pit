import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, galleryRow, sql } from '@/lib/app-database';
import { resolveSocialMedia } from '@/lib/social-media';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const isAdmin = await requireAdminSession();
    const includeAll = request.nextUrl.searchParams.get('all') === '1' && isAdmin;
    const rows = includeAll
      ? await sql`SELECT * FROM gallery_items ORDER BY sort_order, id`
      : await sql`SELECT * FROM gallery_items WHERE published = true ORDER BY sort_order, id`;
    return NextResponse.json(rows.map(galleryRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json({ error: 'Galeri gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const title = String(body.title || '').trim();
    const mediaUrl = String(body.mediaUrl || '').trim();
    const type = body.type === 'video' ? 'video' : 'photo';
    if (!title || !mediaUrl) return NextResponse.json({ error: 'Judul dan file media wajib diisi.' }, { status: 400, headers: noStore });
    const social = type === 'video' ? await resolveSocialMedia(mediaUrl) : null;
    const provider = social?.provider || 'upload';
    const embedUrl = social?.embedUrl || '';
    const playbackUrl = social?.playbackUrl || '';
    const aspectRatio = social?.aspectRatio || String(body.aspectRatio || (type === 'photo' ? '4 / 3' : '16 / 9'));
    const thumbnailUrl = social?.thumbnailUrl || String(body.thumbnailUrl || (type === 'photo' ? mediaUrl : ''));
    const rows = await sql`
      INSERT INTO gallery_items (title, media_type, media_url, media_public_id, thumbnail_url, thumbnail_public_id, caption, sort_order, published, provider, embed_url, playback_url, aspect_ratio)
      VALUES (${title}, ${type}, ${social?.sourceUrl || mediaUrl}, ${body.mediaPublicId || null}, ${thumbnailUrl},
        ${body.thumbnailPublicId || null}, ${String(body.caption || '').trim()},
        ${Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0}, ${body.published !== false}, ${provider}, ${embedUrl}, ${playbackUrl}, ${aspectRatio})
      RETURNING *
    `;
    return NextResponse.json(galleryRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: 'Item galeri gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
