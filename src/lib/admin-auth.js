import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'kulino_admin_session';
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.');
  }
  return secret;
}

function sign(value) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function safeCompare(left, right) {
  const key = getSessionSecret();
  const leftDigest = createHmac('sha256', key).update(String(left)).digest();
  const rightDigest = createHmac('sha256', key).update(String(right)).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function hasAdminAuthConfig() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET?.length >= 32
  );
}

export function validateAdminCredentials(email, password) {
  if (!hasAdminAuthConfig()) return false;

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const configuredEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();

  return (
    safeCompare(normalizedEmail, configuredEmail) &&
    safeCompare(password || '', process.env.ADMIN_PASSWORD)
  );
}

export function createAdminSessionToken(email) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    email: String(email).trim().toLowerCase(),
    role: 'admin',
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE,
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;

    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;

    const expected = Buffer.from(sign(payload), 'base64url');
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return null;
    }

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (session.role !== 'admin' || !session.email || !session.exp || session.exp <= now) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function getAdminSessionFromRequest(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminSession() {
  return Boolean(await getAdminSession());
}
