/*
  To'lov qoidalari — sof funksiyalar (DB'siz). Kalkulyator (paymentActions) va "Uyingizni toping"
  o'yini (matchActions) shu yerdagi YAGONA manbadan foydalanadi.

  Egasining qoidasi (2026-10): oylik to'lov — XONALAR soniga qarab STANDART summa:
     1 xona -> 4 mln, 2 xona -> 5 mln, 3 xona -> 6 mln, 4+ xona -> 7 mln (so'm/oy).
  Admin sozlamalari: pay_monthly_1 .. pay_monthly_4 (4 = "4 va undan ko'p").
  Qolgan summa / muddat saytda KO'RSATILMAYDI — mijoz kontakt qoldiradi.

  Boshlang'ich to'lov (narxga bog'liq SUMMA emas — faqat foiz yoki hammaga ma'lum qat'iy summa):
   - 7, 8-bloklarning 7-qavat va undan yuqorisi -> qat'iy 40 mln (pay_fixed_*).
   - Ipoteka bloklari (10, 11) -> pay_mort_down_pct (standart 15%).
   - Qolganlari -> pay_down_pct (standart 30%).
*/

export const MONTHLY_DEFAULTS: Record<1 | 2 | 3 | 4, number> = {
  1: 4_000_000,
  2: 5_000_000,
  3: 6_000_000,
  4: 7_000_000,
};

export type PayResult = {
  monthly: number;
  downPct?: number; // foiz
  downFixed?: number; // qat'iy summa (ommaviy shart)
};

export type PayRow = { floor: number; rooms: number; name_uz: string; block_no?: number | null };

const parseList = (s?: string) =>
  (s || '').split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !isNaN(n));

const num = (v: string | undefined, def: number) => {
  const n = Number(v);
  return v != null && String(v).trim() !== '' && Number.isFinite(n) && n >= 0 ? n : def;
};

/** Xonalar soniga qarab standart oylik to'lov (so'm). */
export function standardMonthly(rooms: number, s: Record<string, string>): number {
  const k = (Math.min(4, Math.max(1, Math.round(Number(rooms) || 1))) as 1 | 2 | 3 | 4);
  return num(s[`pay_monthly_${k}`], MONTHLY_DEFAULTS[k]);
}

export function computePayment(row: PayRow, s: Record<string, string>): PayResult {
  // Blok raqami — admin belgilagan maydon; bo'lmasa (eski yozuv) nomdan: "10-blok" -> 10
  const blockNum = Number(row.block_no) || parseInt(row.name_uz, 10) || 0;
  const monthly = standardMonthly(row.rooms, s);

  const fixedBlocks = parseList(s.pay_fixed_blocks || '7,8');
  const fixedFromFloor = num(s.pay_fixed_from_floor, 7);
  if (fixedBlocks.includes(blockNum) && Number(row.floor) >= fixedFromFloor) {
    return { monthly, downFixed: num(s.pay_fixed_amount, 40_000_000) };
  }
  const mortgageBlocks = parseList(s.pay_mortgage_blocks || '10,11');
  if (mortgageBlocks.includes(blockNum)) {
    return { monthly, downPct: Math.min(90, num(s.pay_mort_down_pct, 15)) };
  }
  return { monthly, downPct: Math.min(90, num(s.pay_down_pct, 30)) };
}
