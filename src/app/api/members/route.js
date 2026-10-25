import { NextResponse } from 'next/server';
import { ensureAppDatabase, sql } from '@/lib/app-database';
import { createMemberSessionToken, MEMBER_SESSION_COOKIE, MEMBER_SESSION_MAX_AGE } from '@/lib/member-auth';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function clean(value, max = 180) {
  return String(value || '').trim().slice(0, max);
}

function normalizePhone(value) {
  return clean(value, 40).replace(/[^\d+]/g, '');
}

function isValidPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
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
    const body = await request.json();
    const name = clean(body.name, 120);
    const phone = normalizePhone(body.wa || body.phone);
    const email = clean(body.email, 180).toLowerCase();
    const address = clean(body.address, 500);
    const provider = clean(body.provider || 'form', 30);
    const photoUrl = clean(body.photo || body.photoUrl, 500);
    if (!name || !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Nama dan nomor WhatsApp yang valid wajib diisi.' }, { status: 400, headers: noStore });
    }
    await ensureAppDatabase();

    const identityKey = makeIdentity({ email, phone, name, provider });
    const rows = await sql`
      INSERT INTO members (member_code, identity_key, name, phone, email, address, provider, photo_url)
      VALUES (${memberCode()}, ${identityKey}, ${name}, ${phone}, ${email}, ${address}, ${provider}, ${photoUrl})
      ON CONFLICT (identity_key) DO UPDATE SET
        name = EXCLUDED.name,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE members.phone END,
        email = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE members.email END,
        address = CASE WHEN EXCLUDED.address <> '' THEN EXCLUDED.address ELSE members.address END,
        provider = EXCLUDED.provider,
        photo_url = CASE WHEN EXCLUDED.photo_url <> '' THEN EXCLUDED.photo_url ELSE members.photo_url END,
        last_login_at = NOW(),
        updated_at = NOW()
      RETURNING id, member_code, name, phone, email, address, provider, photo_url, created_at
    `;
    const member = rows[0];
    const response = NextResponse.json({
      memberId: member.member_code,
      name: member.name,
      wa: member.phone,
      email: member.email,
      address: member.address,
      provider: member.provider,
      photo: member.photo_url || null,
      registeredAt: member.created_at,
    }, { status: 201, headers: noStore });
    response.cookies.set({
      name: MEMBER_SESSION_COOKIE,
      value: createMemberSessionToken(member),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MEMBER_SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json({ error: 'Data member gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
