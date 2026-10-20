'use server';

import db from './db';
import { computePayment } from './paymentCalc';

/*
  To'lov SERVERDA hisoblanadi (qoidalar: paymentCalc.ts). Xonadon narxi (price_cash)
  mijozga qaytarilmaydi. Boshlang'ich va qoldiq SUMMASI ham qaytarilmaydi (ikkalasini
  qo'shsa aniq narx chiqardi) — faqat boshlang'ich foizi (yoki hammaga ma'lum qat'iy summa),
  10 ming so'mgacha yaxlitlangan oylik va muddat.
*/

export type PublicPay = {
  mode: 'hybrid' | 'mortgage';
  monthly: number;
  months: number;
  rate?: number;
  downPct?: number;
  downFixed?: number; // 7–8-bloklar yuqori qavat: qat'iy 40 mln (ommaviy shart)
};

async function loadSettings(): Promise<Record<string, string>> {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  return rows.reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);
}

export async function getApartmentPayment(
  apartmentId: number,
  opts?: { downPct?: number; years?: number }
): Promise<PublicPay | null> {
  if (!apartmentId) return null;
  const row = (await db
    .prepare('SELECT a.price_cash, a.floor, a.rooms, p.name_uz FROM apartments a JOIN projects p ON p.id = a.project_id WHERE a.id = ?')
    .get(apartmentId)) as { price_cash: number; floor: number; rooms: number; name_uz: string } | undefined;
  if (!row) return null;
  const r = computePayment(row, await loadSettings(), opts);
  if (!r) return null;
  return {
    mode: r.mode,
    monthly: Math.round(r.monthly / 10_000) * 10_000,
    months: r.months,
    rate: r.rate,
    downPct: r.downPct,
    downFixed: r.downPct == null ? r.downAmount : undefined,
  };
}
