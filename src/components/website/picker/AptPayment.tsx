'use client';

// Xonadon detali ichidagi to'lov: boshlang'ich to'lov va standart oylik to'lov (serverda hisoblanadi,
// narx va qolgan summa mijozga yuborilmaydi). Natija xonadon bo'yicha eslab qolinadi — oldingi/keyingi
// xonadonga o'tib qaytganda server qayta chaqirilmaydi.
import { useEffect, useState } from 'react';
import { getApartmentPayment, type PublicPay } from '@/lib/paymentActions';
import type { PickerLang } from './i18n';

const T = {
  uz: { title: "Tölov", down: "Boşlanğiç tölov", monthly: "Oylik tölov", sum: "söm", perMonth: 'oyiga', rest: 'Qolgan summani menejer hisoblab beradi.', loading: 'Hisoblanmoqda…', agreed: 'Menejer bilan kelişiladi' },
  ru: { title: 'Оплата', down: 'Первый взнос', monthly: 'Ежемесячный платёж', sum: 'сум', perMonth: 'в месяц', rest: 'Остаток суммы рассчитает менеджер.', loading: 'Считаем…', agreed: 'Согласуется с менеджером' },
  en: { title: 'Payment', down: 'Down payment', monthly: 'Monthly payment', sum: 'UZS', perMonth: 'per month', rest: 'A manager will calculate the remaining amount.', loading: 'Calculating…', agreed: 'Agreed with a manager' },
};

// null — server hisoblay olmadi (limit, sotilgan yoki xato): "kelishiladi" ko'rsatiladi
const cache = new Map<number, PublicPay | null>();
const nf = (x: number) => Math.round(x).toLocaleString('ru-RU');

export default function AptPayment({ aptId, lang }: { aptId: number; lang: PickerLang }) {
  const t = T[lang] || T.uz;
  const [state, setState] = useState<{ id: number; pay: PublicPay | null } | null>(() => (cache.has(aptId) ? { id: aptId, pay: cache.get(aptId) ?? null } : null));

  useEffect(() => {
    if (cache.has(aptId)) return;
    let cancelled = false;
    const done = (pay: PublicPay | null) => {
      // Xato (tarmoq) eslab qolinmaydi — keyingi ochilishda qayta uriniladi
      if (pay) cache.set(aptId, pay);
      if (!cancelled) setState({ id: aptId, pay });
    };
    getApartmentPayment(aptId).then(done).catch(() => done(null));
    return () => { cancelled = true; };
  }, [aptId]);

  const cur = cache.has(aptId) ? { id: aptId, pay: cache.get(aptId) ?? null } : state && state.id === aptId ? state : null;
  const pay = cur?.pay;
  const down = !cur ? t.loading : pay ? (pay.downFixed != null ? `${nf(pay.downFixed)} ${t.sum}` : pay.downPct != null ? `${pay.downPct}%` : t.agreed) : t.agreed;
  const monthly = !cur ? t.loading : pay ? `${nf(pay.monthly)} ${t.sum} ${t.perMonth}` : t.agreed;

  return (
    <section aria-label={t.title} className="rounded-v-md border border-line">
      <dl className="grid grid-cols-2 divide-x divide-line" aria-live="polite" aria-busy={!cur}>
        <div className="px-3 py-2">
          <dt className="text-small text-ink-muted">{t.down}</dt>
          <dd className="text-body font-semibold text-ink">{down}</dd>
        </div>
        <div className="px-3 py-2">
          <dt className="text-small text-ink-muted">{t.monthly}</dt>
          <dd className="text-body font-semibold text-ink">{monthly}</dd>
        </div>
      </dl>
      <p className="border-t border-line px-3 py-1.5 text-small text-ink-muted">{t.rest}</p>
    </section>
  );
}
