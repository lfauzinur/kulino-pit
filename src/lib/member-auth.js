import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const MEMBER_SESSION_COOKIE = 'kulino_member_session';
export const MEMBER_SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function sessionSecret() {
  const value = process.env.MEMBER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('MEMBER_SESSION_SECRET atau ADMIN_SESSION_SECRET minimal 32 karakter wajib tersedia.');
  }
  return value;
}

function signature(value) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

export function createMemberSessionToken(member) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    memberId: Number(member.id),
    memberCode: String(member.member_code),
    role: 'member',
    iat: now,
    exp: now + MEMBER_SESSION_MAX_AGE,
  })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function verifyMemberSessionToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const [payload, receivedSignature, extra] = token.split('.');
    if (!payload || !receivedSignature || extra) return null;
    const expected = Buffer.from(signature(payload), 'base64url');
    const received = Buffer.from(receivedSignature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (session.role !== 'member' || !session.memberId || !session.memberCode || session.exp <= now) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  return verifyMemberSessionToken(cookieStore.get(MEMBER_SESSION_COOKIE)?.value);
}
