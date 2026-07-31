import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

// Protects the whole /admin/* area. The login page is the only public exception.
// (Next.js 16 renamed the `middleware` convention to `proxy`.)
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userId = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === '/admin/login') {
    // Already authenticated → skip the login screen.
    if (userId) return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    return NextResponse.next();
  }

  if (!userId) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
