import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export function proxy(request) {
  const session = getAdminSessionFromRequest(request);
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
