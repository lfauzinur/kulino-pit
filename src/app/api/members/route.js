import { NextResponse } from 'next/server';
import { ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function clean(value, max = 180) {
  return String(value || '').trim().slice(0, max);
}

function makeIdentity({ email, phone, name, provider }) {
  if (email) return `email:${email.toLowerCase()}`;
  if (phone) return `phone:${phone.replace(/\D/g, '')}`;
  return `${provider || 'form'}:${name.toLowerCase().replace(/\s+/g, '-')}`;
}

function memberCode() {
  return `KP-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export async function POST(request) {
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const name = clean(body.name, 120);
    const phone = clean(body.wa || body.phone, 40);
    const email = clean(body.email, 180).toLowerCase();
    const provider = clean(body.provider || 'form', 30);
    const photoUrl = clean(body.photo || body.photoUrl, 500);
    if (!name) return NextResponse.json({ error: 'Nama member wajib diisi.' }, { status: 400, headers: noStore });

    const identityKey = makeIdentity({ email, phone, name, provider });
    const rows = await sql`
      INSERT INTO members (member_code, identity_key, name, phone, email, provider, photo_url)
      VALUES (${memberCode()}, ${identityKey}, ${name}, ${phone}, ${email}, ${provider}, ${photoUrl})
      ON CONFLICT (identity_key) DO UPDATE SET
        name = EXCLUDED.name,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE members.phone END,
        email = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE members.email END,
        provider = EXCLUDED.provider,
        photo_url = CASE WHEN EXCLUDED.photo_url <> '' THEN EXCLUDED.photo_url ELSE members.photo_url END,
        last_login_at = NOW(),
        updated_at = NOW()
      RETURNING member_code, name, phone, email, provider, photo_url, created_at
    `;
    const member = rows[0];
    return NextResponse.json({
      memberId: member.member_code,
      name: member.name,
      wa: member.phone,
      email: member.email,
      provider: member.provider,
      photo: member.photo_url || null,
      registeredAt: member.created_at,
    }, { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json({ error: 'Data member gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
