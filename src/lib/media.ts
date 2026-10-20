/*
  Bazadagi rasm qiymatini (Blob URL, /uploads yo'li yoki base64 data URL) javobga aylantirish.
  Vercel Blob yopiq bo'lgani uchun yangi yuklangan rasmlar data URL bo'lib bazada turadi —
  ularni sahifa ichiga joylasak sahifa megabaytlab og'irlashadi, shuning uchun alohida
  manzil orqali beramiz (/api/apt-image, /api/media).

  Xavfsizlik: faqat rastr rasm turlari (SVG ichida skript bo'lishi mumkin) va nosniff.
*/

const SAFE_IMAGE = /^image\/(png|jpe?g|webp|gif|avif)$/i;

export const isDataUrl = (v: unknown): v is string => typeof v === 'string' && v.startsWith('data:');

export function serveStoredImage(v: string | null | undefined, origin: string): Response {
  if (!v) return new Response(null, { status: 404 });

  // Tashqi (Blob) yoki lokal manzil bo'lsa — o'sha manzilga yo'naltiramiz
  if (/^https?:\/\//i.test(v)) return Response.redirect(v, 302);
  if (v.startsWith('/') && !v.startsWith('//')) return Response.redirect(new URL(v, origin).toString(), 302);

  const m = v.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
  if (!m) return new Response(null, { status: 404 });
  const mime = (m[1] || '').toLowerCase();
  if (!SAFE_IMAGE.test(mime)) return new Response(null, { status: 415 });
  const buf = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]), 'utf8');

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(buf.length),
      'X-Content-Type-Options': 'nosniff',
      // Qisqa kesh — o'zgartirilgan rasm ~1 daqiqada ko'rinadi
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

// Ommaviy sahifalar uchun: data URL o'rniga /api/media manzili (admin sahifalarida ISHLATILMAYDI —
// u yerda asl qiymat formaga qaytib saqlanadi).
type WithImages = { id: number; main_image?: string | null; gallery?: string[]; virtual_tour_url?: string | null };

export function publicProjectMedia<T extends WithImages>(p: T): T {
  const u = (f: string, i?: number) => `/api/media?t=project&id=${p.id}&f=${f}${i != null ? `&i=${i}` : ''}`;
  return {
    ...p,
    main_image: isDataUrl(p.main_image) ? u('main') : p.main_image,
    gallery: (p.gallery || []).map((g, i) => (isDataUrl(g) ? u('gallery', i) : g)),
    virtual_tour_url: isDataUrl(p.virtual_tour_url) ? u('tour') : p.virtual_tour_url,
  };
}

export function publicNewsMedia<T extends { id: number; image?: string | null }>(n: T): T {
  return { ...n, image: isDataUrl(n.image) ? `/api/media?t=news&id=${n.id}&f=image` : n.image };
}
