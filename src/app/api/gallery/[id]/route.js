import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, galleryRow, sql } from '@/lib/app-database';
import { resolveSocialMedia } from '@/lib/social-media';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
async function getId(params) { const { id } = await params; const value = Number(id); return Number.isSafeInteger(value) && value > 0 ? value : null; }

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    const body = await request.json();
    const title = String(body.title || '').trim();
    const mediaUrl = String(body.mediaUrl || '').trim();
    const type = body.type === 'video' ? 'video' : 'photo';
    if (!id || !title || !mediaUrl) return NextResponse.json({ error: 'Data galeri tidak valid.' }, { status: 400, headers: noStore });
    const social = type === 'video' ? await resolveSocialMedia(mediaUrl) : null;
    const provider = social?.provider || 'upload';
    const embedUrl = social?.embedUrl || '';
    const playbackUrl = social?.playbackUrl || '';
    const aspectRatio = social?.aspectRatio || String(body.aspectRatio || (type === 'photo' ? '4 / 3' : '16 / 9'));
    const thumbnailUrl = social?.thumbnailUrl || String(body.thumbnailUrl || (type === 'photo' ? mediaUrl : ''));
    const rows = await sql`
      UPDATE gallery_items SET title = ${title}, media_type = ${type}, media_url = ${social?.sourceUrl || mediaUrl},
        media_public_id = ${body.mediaPublicId || null}, thumbnail_url = ${thumbnailUrl},
        thumbnail_public_id = ${body.thumbnailPublicId || null}, caption = ${String(body.caption || '').trim()},
        sort_order = ${Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0},
        published = ${body.published !== false}, provider = ${provider}, embed_url = ${embedUrl}, playback_url = ${playbackUrl}, aspect_ratio = ${aspectRatio}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Item galeri tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json(galleryRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/gallery/[id] error:', error);
    return NextResponse.json({ error: 'Item galeri gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const id = await getId(params);
    if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400, headers: noStore });
    const rows = await sql`DELETE FROM gallery_items WHERE id = ${id} RETURNING *`;
    if (!rows.length) return NextResponse.json({ error: 'Item galeri tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json({ success: true, item: galleryRow(rows[0]) }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/gallery/[id] error:', error);
    return NextResponse.json({ error: 'Item galeri gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
