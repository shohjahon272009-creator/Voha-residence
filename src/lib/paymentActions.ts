'use server';

import db from './db';
import { computePayment } from './paymentCalc';
import { allowRequest } from './memLimit';

/*
  To'lov SERVERDA hisoblanadi (qoidalar: paymentCalc.ts). Xonadon narxi (price_cash) bu yerda
  umuman o'qilmaydi va mijozga qaytarilmaydi. Qaytariladi faqat: xonalar soniga qarab STANDART
  oylik to'lov va boshlang'ich to'lov FOIZI (yoki hammaga ma'lum qat'iy summa — 40 mln).
  Qolgan summa / muddat ko'rsatilmaydi — mijoz kontakt qoldiradi.
*/

export type PublicPay = {
  monthly: number;
  downPct?: number;
  downFixed?: number; // 7–8-bloklar yuqori qavat: qat'iy 40 mln (ommaviy shart)
};

async function loadSettings(): Promise<Record<string, string>> {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  return rows.reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);
}

export async function getApartmentPayment(apartmentId: number): Promise<PublicPay | null> {
  if (!Number.isInteger(apartmentId) || apartmentId <= 0) return null;
  // Bir IP'dan daqiqasiga ko'pi bilan 40 ta hisob (barcha xonadonlarni skript bilan tortib olishni sekinlatadi)
  if (!(await allowRequest('calc', 40))) return null;
  const row = (await db
    .prepare(`SELECT a.floor, a.rooms, a.status, p.name_uz, p.block_no, COALESCE(p.is_sold_out, 0) AS sold_out
              FROM apartments a JOIN projects p ON p.id = a.project_id WHERE a.id = ?`)
    .get(apartmentId)) as { floor: number; rooms: number; status: string; name_uz: string; block_no: number | null; sold_out: number } | undefined;
  // Faqat sotuvdagi (bo'sh) xonadonlar uchun
  if (!row || row.status !== "Bo'sh" || Number(row.sold_out)) return null;
  const r = computePayment(
    { floor: Number(row.floor) || 0, rooms: Number(row.rooms) || 0, name_uz: String(row.name_uz ?? ''), block_no: row.block_no == null ? null : Number(row.block_no) },
    await loadSettings(),
  );
  return { monthly: r.monthly, downPct: r.downPct, downFixed: r.downFixed };
}
