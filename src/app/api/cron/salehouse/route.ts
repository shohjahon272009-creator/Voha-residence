import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { salehouseConfigured } from '@/lib/salehouse';
import { buildReport, applyReport } from '@/lib/salehouseSync';
import { readJob } from '@/lib/salehouseJob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
  Server cron'i (har 10 daqiqada) chaqiradi: curl -X POST -H "x-cron-secret: $CRON_SECRET" http://127.0.0.1:3000/api/cron/salehouse
  Himoya: maxfiy sarlavha (CRON_SECRET, faqat server .env.local'da) va faqat server ichidan —
  nginx orqali kelgan so'rovda x-real-ip bo'ladi, bunday so'rov rad etiladi.
  Admin "avtomatik"ni yoqmaguncha hech narsa qilmaydi.
*/
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret || req.headers.get('x-real-ip')) {
    return new NextResponse('Not found', { status: 404 });
  }
  // "Avtomatik" ishlayotganini admin ko'rsin — har chaqiruv vaqti yoziladi
  const now = new Date().toISOString();
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_salehouse_cron_at', now, now);
  if (!salehouseConfigured()) return NextResponse.json({ ok: false, reason: 'not-configured' });
  const auto = await db.prepare('SELECT value FROM settings WHERE key = ?').get('_salehouse_auto') as { value: string } | undefined;
  if (auto?.value !== '1') return NextResponse.json({ ok: true, skipped: 'auto-off' });
  // Admin qo'lda hisobot olayotgan bo'lsa — bu safar o'tkazib yuboramiz (Sale House limiti)
  if ((await readJob()).running) return NextResponse.json({ ok: true, skipped: 'manual-running' });
  try {
    const report = await buildReport();
    const applied = await applyReport(report);
    return NextResponse.json({ ok: true, applied, changes: report.changes.length });
  } catch (e) {
    const msg = (e as Error).message;
    await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_salehouse_error', msg, msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
