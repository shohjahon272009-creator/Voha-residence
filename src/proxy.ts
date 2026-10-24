import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // "/" -> "/uz" endi next.config.ts rewrites'da: bu yerdagi NextResponse.rewrite(new URL('/uz', req.url))
  // nginx (https) ortida https://localhost:3000/uz ga "proksi" qilmoqchi bo'lib 500 berardi.

  if (pathname.startsWith('/admin')) {
    // Admin layout yo'lni bilishi uchun (bekor qilingan sessiyada login'ga qaytarish)
    const headers = new Headers(req.headers);
    headers.set('x-pathname', pathname);

    // Login sahifasi doim ochiq. Imzosi to'g'ri, lekin bekor qilingan (eski versiya) token bilan
    // dashboard'ga yo'naltirsak, layout yana login'ga qaytarib — cheksiz aylanish bo'lardi.
    if (pathname === '/admin/login') return NextResponse.next({ request: { headers } });

    // Bu yerda faqat imzo va muddat (bazasiz). Sessiya bekor qilinganmi — admin layout va
    // requireAdmin bazadagi session_version bilan tekshiradi.
    const userId = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!userId) return NextResponse.redirect(new URL('/admin/login', req.url));
    return NextResponse.next({ request: { headers } });
  }

  // Til sahifalari: root layout <html lang> ni to'g'ri qo'yishi uchun tilni header'da uzatamiz
  const langMatch = pathname.match(/^\/(uz|ru|en)(\/|$)/);
  if (langMatch) {
    const headers = new Headers(req.headers);
    headers.set('x-lang', langMatch[1]);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/(uz|ru|en)', '/(uz|ru|en)/:path*'],
};
