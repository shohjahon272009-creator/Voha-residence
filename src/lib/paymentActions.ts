'use server';

import db from './db';

// Tanlangan xonadonning to'lovini SERVERDA hisoblaydi.
// Muhim: xonadonning to'liq narxi (price_cash) mijozga QAYTARILMAYDI —
// faqat oylik to'lov qaytadi. Shu sababli raqobatchilar sahifa manbasidan
// aniq narxni ololmaydi (narx faqat serverda ishlatiladi).
export type PaymentMode = 'hybrid' | 'mortgage';

// Qaytadi: boshlang'ich to'lov, oylik to'lov va qoldiq (qolgan summa).
// price_cash ning o'zi (yaxlit narx) hech qachon qaytarilmaydi — faqat serverда
// ishlatiladi. Shu sababli barcha xonadon narxlari sahifa manbasiga to'kilmaydi;
// mijoz har xonadonni tanlaganda faqat o'sha to'lov ma'lumoti keladi.
export async function getApartmentPayment(
  apartmentId: number,
  mode: PaymentMode,
  params: { down: number; months: number; rate?: number; payType?: 'annuity' | 'diff' }
): Promise<{ monthly: number; remaining: number; downAmount: number } | null> {
  if (!apartmentId) return null;
  const row = (await db
    .prepare('SELECT price_cash FROM apartments WHERE id = ?')
    .get(apartmentId)) as { price_cash: number } | undefined;
  const price = Number(row?.price_cash) || 0;
  if (price <= 0) return null;

  const down = Math.min(90, Math.max(0, params.down || 0));
  const downAmount = Math.round(price * (down / 100));
  const remaining = Math.max(0, price - downAmount);

  if (mode === 'hybrid') {
    const months = Math.max(1, params.months || 1);
    return { monthly: Math.round(remaining / months), remaining, downAmount };
  }

  // mortgage
  const months = Math.max(1, params.months || 1);
  const r = (params.rate ?? 18) / 100 / 12;
  if (params.payType === 'diff') {
    // birinchi (eng katta) differensial to'lov
    return { monthly: Math.round(remaining / months + remaining * r), remaining, downAmount };
  }
  const annuity =
    r > 0
      ? (remaining * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
      : remaining / months;
  return { monthly: Math.round(annuity), remaining, downAmount };
}
