'use server';

import db from './db';
import { computePayment, type PayResult } from './paymentCalc';

/*
  To'lov SERVERDA hisoblanadi (qoidalar: paymentCalc.ts). Xonadon narxi (price_cash)
  mijozga qaytarilmaydi — faqat oylik/boshlang'ich/qoldiq qaytadi.
*/

export type { PayResult };

async function loadSettings(): Promise<Record<string, string>> {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  return rows.reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);
}

export async function getApartmentPayment(
  apartmentId: number,
  opts?: { downPct?: number; years?: number }
): Promise<PayResult | null> {
  if (!apartmentId) return null;
  const row = (await db
    .prepare('SELECT a.price_cash, a.floor, a.rooms, p.name_uz FROM apartments a JOIN projects p ON p.id = a.project_id WHERE a.id = ?')
    .get(apartmentId)) as { price_cash: number; floor: number; rooms: number; name_uz: string } | undefined;
  if (!row) return null;
  return computePayment(row, await loadSettings(), opts);
}
