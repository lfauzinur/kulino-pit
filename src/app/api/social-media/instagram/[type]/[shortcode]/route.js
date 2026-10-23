import { NextResponse } from 'next/server';
import { resolveInstagramAsset } from '@/lib/social-media';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { type, shortcode } = await params;
  const asset = request.nextUrl.searchParams.get('asset') === 'thumbnail' ? 'thumbnail' : 'video';
  try {
    const url = await resolveInstagramAsset(type, shortcode, asset);
    if (!url) return NextResponse.json({ error: 'Media Instagram tidak tersedia.' }, { status: 404 });
    return NextResponse.redirect(url, {
      status: 307,
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('GET Instagram media error:', error);
    return NextResponse.json({ error: 'Media Instagram gagal dimuat.' }, { status: 502 });
  }
}
