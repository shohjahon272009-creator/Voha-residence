import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root route / -> rewrite to /uz seamlessly
  if (pathname === '/' || pathname === '') {
    return NextResponse.rewrite(new URL('/uz', req.url));
  }

  if (pathname.startsWith('/admin')) {
    const userId = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

    if (pathname === '/admin/login') {
      if (userId) return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      return NextResponse.next();
    }

    if (!userId) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
