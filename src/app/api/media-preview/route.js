import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { resolveSocialMedia } from '@/lib/social-media';

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const preview = await resolveSocialMedia(body.url);
  if (!preview) {
    return NextResponse.json({ error: 'Gunakan link share publik YouTube, Instagram, atau TikTok yang valid.' }, { status: 400 });
  }
  return NextResponse.json(preview, { headers: { 'Cache-Control': 'no-store' } });
}
