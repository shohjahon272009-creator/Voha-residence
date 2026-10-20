import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { serveStoredImage } from '@/lib/media';

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
  return serveStoredImage(row?.v, url.origin);
}
