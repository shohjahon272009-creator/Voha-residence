import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { serveStoredImage } from '@/lib/media';

export const runtime = 'nodejs';

/*
  Loyiha va yangilik rasmlarini (bazadagi base64) alohida manzil orqali beradi — sahifa ichiga
  joylanmasin. /api/media?t=project&id=1&f=main|gallery|tour&i=0  ·  /api/media?t=news&id=3&f=image
*/
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const t = url.searchParams.get('t');
  const f = url.searchParams.get('f');
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return new Response(null, { status: 400 });

  let value: string | null | undefined;
  if (t === 'project') {
    const col = f === 'main' ? 'main_image' : f === 'gallery' ? 'gallery' : f === 'tour' ? 'virtual_tour_url' : null;
    if (!col) return new Response(null, { status: 400 });
    const row = (await db.prepare(`SELECT ${col} AS v FROM projects WHERE id = ?`).get(id)) as { v?: string } | undefined;
    value = row?.v;
    if (col === 'gallery') {
      const i = Number(url.searchParams.get('i'));
      try {
        const list = JSON.parse(value || '[]');
        value = Array.isArray(list) && Number.isInteger(i) ? list[i] : undefined;
      } catch { value = undefined; }
    }
  } else if (t === 'news' && f === 'image') {
    const row = (await db.prepare('SELECT image AS v FROM news WHERE id = ? AND visible = 1').get(id)) as { v?: string } | undefined;
    value = row?.v;
  } else {
    return new Response(null, { status: 400 });
  }

  return serveStoredImage(value, url.origin);
}
