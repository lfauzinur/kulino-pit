import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  hasAdminAuthConfig,
  validateAdminCredentials,
} from '@/lib/admin-auth';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(request) {
  if (!hasAdminAuthConfig()) {
    console.error('Admin authentication environment variables are not configured.');
    return NextResponse.json(
      { error: 'Autentikasi admin belum dikonfigurasi.' },
      { status: 503, headers: noStoreHeaders }
    );
  }

  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400, headers: noStoreHeaders }
      );
    }

    if (!validateAdminCredentials(email, password)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const response = NextResponse.json(
      { success: true },
      { headers: noStoreHeaders }
    );
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: createAdminSessionToken(email),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Format request tidak valid.' },
      { status: 400, headers: noStoreHeaders }
    );
  }
}
