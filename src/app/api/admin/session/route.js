import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  getAdminSession,
} from '@/lib/admin-auth';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(
    { authenticated: true, email: session.email },
    { headers: noStoreHeaders }
  );
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true },
    { headers: noStoreHeaders }
  );
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
