'use server';

import db from './db';
import { computePayment } from './paymentCalc';
import { allowRequest } from './memLimit';

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
  if (!Number.isInteger(apartmentId) || apartmentId <= 0) return null;
  // Faqat saytdagi tugmalar qiymatlari — ixtiyoriy foiz/muddat bilan chaqirib, narxni teskari
  // hisoblash osonlashmasin
  const downPct = [15, 25, 30].includes(Number(opts?.downPct)) ? Number(opts?.downPct) : 15;
  const years = [3, 5, 10, 15, 20].includes(Number(opts?.years)) ? Number(opts?.years) : 5;
  // Bir IP'dan daqiqasiga ko'pi bilan 40 ta hisob (barcha xonadonlarni skript bilan tortib olishni sekinlatadi)
  if (!(await allowRequest('calc', 40))) return null;
  const row = (await db
    .prepare(`SELECT a.price_cash, a.floor, a.rooms, a.status, p.name_uz, COALESCE(p.is_sold_out, 0) AS sold_out
              FROM apartments a JOIN projects p ON p.id = a.project_id WHERE a.id = ?`)
    .get(apartmentId)) as { price_cash: number; floor: number; rooms: number; status: string; name_uz: string; sold_out: number } | undefined;
  // Sotilgan/bronlangan xonadon uchun to'lov hisoblanmaydi (sotuv narxi oshkor bo'lmasin)
  if (!row || row.status !== "Bo'sh" || Number(row.sold_out)) return null;
  const r = computePayment(row, await loadSettings(), { downPct, years });
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
