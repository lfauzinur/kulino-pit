import { NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE } from '@/lib/member-auth';

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: MEMBER_SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  return response;
}
