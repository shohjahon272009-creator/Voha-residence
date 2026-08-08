'use server';

import db from './db';

/*
  To'lov SERVERDA, BLOKKA qarab hisoblanadi. Xonadon narxi (price_cash) mijozga
  qaytarilmaydi — faqat oylik/boshlang'ich/qoldiq qaytadi.

  Qoidalar (admin sozlamalaridan o'zgartiriladi):
   - 10, 11-bloklar  -> IPOTEKA. Boshlang'ich 15/25/30%. 15% -> 17.5%, 25/30% -> 17%.
     Muddat 3/5/10/15/20 yil (max 20). Gibrid yo'q.
   - Qolgan bloklar (1..9) -> GIBRID, boshlang'ich 30%.
   - 7, 8-bloklarning 7-qavat va undan yuqorisida boshlang'ich = qat'iy 40 mln.
   - Gibridda oylik to'lov eng kam 4 mln bo'lishi uchun muddat cho'ziladi
     (3 xonalilardan tashqari — ular standart muddatda).
*/

export type PayResult = {
  mode: 'hybrid' | 'mortgage';
  monthly: number;
  downAmount: number;
  remaining: number;
  months: number;
  rate?: number;
  downPct?: number;
};

const parseList = (s?: string) =>
  (s || '').split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !isNaN(n));

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
  const price = Number(row.price_cash) || 0;
  if (price <= 0) return null;

  const s = await loadSettings();
  const blockNum = parseInt(row.name_uz, 10) || 0; // "10-blok" -> 10

  const mortgageBlocks = parseList(s.pay_mortgage_blocks || '10,11');
  const fixedBlocks = parseList(s.pay_fixed_blocks || '7,8');
  const fixedFromFloor = Number(s.pay_fixed_from_floor || 7);
  const fixedAmount = Number(s.pay_fixed_amount || 40000000);
  const downPctDefault = Number(s.pay_down_pct || 30);
  const minMonthly = Number(s.pay_min_monthly || 4000000);
  const maxMonths = Number(s.pay_hybrid_max_months || 60);
  const rateLow = Number(s.mort_rate_low || 17.5);
  const rateHigh = Number(s.mort_rate_high || 17);

  // --- IPOTEKA (10, 11) ---
  if (mortgageBlocks.includes(blockNum)) {
    const downPct = Math.min(90, Math.max(0, opts?.downPct ?? 15));
    const rate = downPct <= 15 ? rateLow : rateHigh;
    const years = Math.min(20, Math.max(1, opts?.years ?? 5));
    const months = years * 12;
    const downAmount = Math.round(price * (downPct / 100));
    const remaining = Math.max(0, price - downAmount);
    const r = rate / 100 / 12;
    const monthly =
      r > 0
        ? Math.round((remaining * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1))
        : Math.round(remaining / months);
    return { mode: 'mortgage', monthly, downAmount, remaining, months, rate, downPct };
  }

  // --- GIBRID (1..9) ---
  const highFloorFixed = fixedBlocks.includes(blockNum) && row.floor >= fixedFromFloor;
  const downAmount = highFloorFixed ? fixedAmount : Math.round(price * (downPctDefault / 100));
  const remaining = Math.max(0, price - downAmount);
  let months: number;
  if (row.rooms >= 3) {
    // 3+ xonalilarda 4 mln cheklovi yo'q — eng uzoq muddat (eng arzon oylik)
    months = maxMonths;
  } else {
    // Boshqalarda oylik ~4 mln bo'lishi uchun muddatni cho'zamiz
    months = Math.max(1, Math.min(maxMonths, Math.ceil(remaining / minMonthly)));
  }
  const monthly = Math.round(remaining / months);
  return { mode: 'hybrid', monthly, downAmount, remaining, months, downPct: highFloorFixed ? undefined : downPctDefault };
}
