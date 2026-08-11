import { NextRequest } from 'next/server';
import db from '@/lib/db';

export const runtime = 'nodejs';

/*
  Xonadon rasmini (chizma yoki surat) alohida manzil orqali beradi.
  Sabab: rasmlar bazada base64 ko'rinishida (75 MB+). Ularni sahifa
  ichiga joylashtirsak sayt qotadi. Bu yerda esa har bir rasm alohida
  so'raladi — brauzer keraklisini yuklaydi, keshda saqlaydi, sahifani bloklamaydi.
  Manzil: /api/apt-image/123?t=plan  (yoki t=photo)
*/
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const col = url.searchParams.get('t') === 'photo' ? 'image' : 'plan_image';

  const row = (await db.prepare(`SELECT ${col} AS v FROM apartments WHERE id = ?`).get(Number(id))) as
    | { v?: string }
    | undefined;
  const v = row?.v;
  if (!v) return new Response(null, { status: 404 });

  // Tashqi (Blob) yoki lokal manzil bo'lsa — o'sha manzilga yo'naltiramiz
  if (/^https?:\/\//i.test(v)) return Response.redirect(v, 302);
  if (v.startsWith('/')) return Response.redirect(new URL(v, url.origin).toString(), 302);

  // data URL (base64) bo'lsa — baytga aylantirib qaytaramiz
  const m = v.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
  if (!m) return new Response(null, { status: 404 });
  const mime = m[1] || 'image/png';
  const buf = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]), 'utf8');

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(buf.length),
      // Qisqa kesh — o'zgartirilgan rasm ~1 daqiqada ko'rinadi
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
