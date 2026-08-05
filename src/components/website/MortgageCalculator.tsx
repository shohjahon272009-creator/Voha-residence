'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Calculator, Info, Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApartmentPayment } from '@/lib/paymentActions';
import { SelectedApartment } from '@/lib/types';

export default function MortgageCalculator({ lang, selected = null, onClearSelected, terms }: { lang: Locale; selected?: SelectedApartment | null; onClearSelected?: () => void; terms?: { down: number; months: number; rate: number; mDown: number; mMonths: number } }) {
  const [mode, setMode] = useState<'hybrid' | 'mortgage'>('hybrid');
  const [price, setPrice] = useState(800000000);

  // Tanlangan xonadon uchun to'lov SERVERDA hisoblanadi — xonadon narxi mijozga yuborilmaydi.
  const [srv, setSrv] = useState<{ monthly: number; remaining: number; downAmount: number; aptId: number } | null>(null);

  // Gibrid: boshlang'ich to'lov + qolgan summa 0% foizsiz muddatli to'lov
  // Boshlang'ich qiymatlar admin sozlagan foizlardan — mijoz ko'rgan to'lov kompaniya bilan TENG chiqadi
  const [hDown, setHDown] = useState(terms?.down ?? 30);
  const [hInstallMonths, setHInstallMonths] = useState(terms?.months ?? 12);

  // Ipoteka
  const [income, setIncome] = useState<'official' | 'unofficial'>('official');
  const [mDown, setMDown] = useState(terms?.mDown ?? 15);
  const [months, setMonths] = useState(terms?.mMonths ?? 24);
  const [mRate, setMRate] = useState(terms?.rate ?? 18);
  const [payType, setPayType] = useState<'annuity' | 'diff'>('annuity');

  // Tanlangan xonadon yoki parametrlar o'zgarganda — to'lovni serverda qayta hisoblaymiz (debounce)
  useEffect(() => {
    if (!selected) return;
    const aptId = selected.id;
    const params =
      mode === 'hybrid'
        ? { down: hDown, months: hInstallMonths }
        : { down: mDown, months, rate: mRate, payType };
    let cancelled = false;
    const timer = setTimeout(() => {
      getApartmentPayment(aptId, mode, params).then((res) => {
        if (!cancelled && res) setSrv({ ...res, aptId });
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selected, mode, hDown, hInstallMonths, mDown, months, mRate, payType]);

  const nf = (x: number) => Math.round(x).toLocaleString('ru-RU');

  // Tanlangan xonadon uchun: muddat va server natijasi tayyorligini aniqlaymiz
  const selTerm = mode === 'hybrid' ? hInstallMonths : months;
  const srvReady = !!(selected && srv && srv.aptId === selected.id);

  // --- Gibrid hisob: boshlang'ich to'lov + qolgan summa 0% foizsiz muddatli ---
  const hDownAmount = Math.round(price * (hDown / 100));
  const hRemaining = Math.max(0, price - hDownAmount);
  const hInstallMonthly = hInstallMonths > 0 ? Math.round(hRemaining / hInstallMonths) : 0;

  // --- Ipoteka hisob ---
  const mDownAmount = Math.round(price * (mDown / 100));
  const loan = Math.max(0, price - mDownAmount);
  const r = mRate / 100 / 12, n = months || 1;
  const annuityMonthly = r > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const diffFirst = loan / n + loan * r;
  const monthly = payType === 'annuity' ? annuityMonthly : diffFirst;
  const totalPay = payType === 'annuity' ? annuityMonthly * n : loan + (loan * r * (n + 1)) / 2;
  const grandTotal = mDownAmount + totalPay;

  const T = ({
    uz: { tag: 'TO‘LOV KALKULYATORI', hybrid: 'Gibrid to‘lov', mortgage: 'Ipoteka', price: 'Xonadon narxi (UZS)', income: 'Daromad', official: 'Rasmiy', unofficial: 'Norasmiy', down: 'Boshlang‘ich to‘lov (%)', install: '0% muddatli ulush (%)', installM: 'Muddatli muddati (oy)', rate: 'Foiz stavkasi (%)', term: 'Kredit muddati (oy)', years: 'Ipoteka muddati (yil)', loan: 'Kredit summasi (UZS)', payType: 'Oylik to‘lov turi', annuity: 'Annuitet', diff: 'Differensial', mo: 'oy', yr: 'yil', consult: 'Konsultatsiya', note: '* Dastlabki hisob-kitob. Yakuniy shartlar bank/loyihaga bog‘liq.', hMonthly: 'Oylik to‘lov', hMonthlyHint: '0% foizsiz muddatli to‘lov', hDownRow: 'Boshlang‘ich to‘lov', hMortRow: 'Qoldiq summa', hTermRow: 'Muddat', hSum: 'yig‘indi', selApt: 'Tanlangan xonadon', xona: 'xona', mMonthly: 'Oylik to‘lovingiz', totalPay: 'Umumiy to‘lovlar', total: 'Jami' },
    ru: { tag: 'КАЛЬКУЛЯТОР ОПЛАТЫ', hybrid: 'Гибридная', mortgage: 'Ипотека', price: 'Цена квартиры (UZS)', income: 'Доход', official: 'Официальный', unofficial: 'Неофициальный', down: 'Первый взнос (%)', install: 'Доля рассрочки 0% (%)', installM: 'Срок рассрочки (мес)', rate: 'Ставка (%)', term: 'Срок кредита (мес)', years: 'Срок ипотеки (лет)', loan: 'Сумма кредита (UZS)', payType: 'Тип платежей', annuity: 'Аннуитет', diff: 'Дифференц.', mo: 'мес', yr: 'лет', consult: 'Консультация', note: '* Предварительный расчёт. Условия зависят от банка/проекта.', hMonthly: 'Ежемесячный платёж', hMonthlyHint: 'Рассрочка 0%', hDownRow: 'Первый взнос', hMortRow: 'Остаток', hTermRow: 'Срок', hSum: 'итого', selApt: 'Выбранная квартира', xona: 'комн.', mMonthly: 'Ежемесячный платёж', totalPay: 'Общая сумма выплат', total: 'Всего' },
    en: { tag: 'PAYMENT CALCULATOR', hybrid: 'Hybrid', mortgage: 'Mortgage', price: 'Apartment price (UZS)', income: 'Income', official: 'Official', unofficial: 'Unofficial', down: 'Down payment (%)', install: '0% installment share (%)', installM: 'Installment term (mo)', rate: 'Rate (%)', term: 'Loan term (mo)', years: 'Mortgage term (yr)', loan: 'Loan amount (UZS)', payType: 'Payment type', annuity: 'Annuity', diff: 'Differentiated', mo: 'mo', yr: 'yr', consult: 'Consultation', note: '* Preliminary calculation. Terms depend on the bank/project.', hMonthly: 'Monthly payment', hMonthlyHint: '0% installment', hDownRow: 'Down payment', hMortRow: 'Remaining', hTermRow: 'Term', hSum: 'total', selApt: 'Selected apartment', xona: 'rooms', mMonthly: 'Monthly payment', totalPay: 'Total payments', total: 'Total' },
  } as const)[lang] || ({} as never);

  const box = 'bg-white/5 border border-white/10 rounded-2xl p-4';
  const pbtn = (on: boolean) => `px-4 h-10 rounded-xl font-bold text-sm transition-all ${on ? 'bg-accent text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`;

  return (
    <section id="calculator" className="py-16 px-6 scroll-mt-20">
      <div className="max-container">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="bg-primary rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg"><Calculator className="text-white" size={24} /></div>
                <div>
                  <span className="text-accent text-xs font-bold uppercase tracking-widest">{T.tag}</span>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{mode === 'hybrid' ? T.hybrid : T.mortgage}</h2>
                </div>
              </div>
              {/* Rejim tanlash: Gibrid (asosiy) / Ipoteka */}
              <div className="flex gap-1 p-1 bg-white/10 rounded-2xl self-start">
                <button onClick={() => setMode('hybrid')} className={`px-5 h-11 rounded-xl font-bold text-sm transition-all ${mode === 'hybrid' ? 'bg-accent text-white shadow' : 'text-white/70 hover:text-white'}`}>{T.hybrid}</button>
                <button onClick={() => setMode('mortgage')} className={`px-5 h-11 rounded-xl font-bold text-sm transition-all ${mode === 'mortgage' ? 'bg-accent text-white shadow' : 'text-white/70 hover:text-white'}`}>{T.mortgage}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected ? (
                  <div className={`${box} sm:col-span-2 flex items-center justify-between gap-3`}>
                    <div className="min-w-0">
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">{T.selApt}</div>
                      <div className="text-white text-lg font-black truncate">№{selected.number} · {selected.rooms} {T.xona} · {selected.area} m²</div>
                      {selected.projectName && <div className="text-white/40 text-xs truncate">{selected.projectName}</div>}
                    </div>
                    <button type="button" onClick={onClearSelected} aria-label="Bekor qilish" className="w-9 h-9 shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><X size={16} /></button>
                  </div>
                ) : (
                  <div className={box}>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{T.price}</label>
                    <input type="text" inputMode="numeric" value={price.toLocaleString('ru-RU')} onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')) || 0)} className="w-full bg-transparent text-white text-2xl font-black outline-none" />
                  </div>
                )}

                {mode === 'hybrid' ? (
                  <>
                    <div className={box}>
                      <div className="flex justify-between mb-2"><label className="text-white/50 text-xs font-bold uppercase tracking-wider">{T.down}</label>{!selected && <span className="text-accent font-black text-sm">{nf(hDownAmount)}</span>}</div>
                      <input type="number" min={0} max={90} value={hDown} onChange={(e) => setHDown(Math.min(90, Math.max(0, Number(e.target.value))))} className="w-full bg-transparent text-white text-2xl font-black outline-none" />
                    </div>
                    <div className={box}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{T.installM}</label>
                      <input type="number" min={1} max={15} value={hInstallMonths} onChange={(e) => setHInstallMonths(Math.min(15, Math.max(1, Number(e.target.value))))} className="w-full bg-transparent text-white text-2xl font-black outline-none" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={box}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{T.income}</label>
                      <div className="flex gap-2">{(['official', 'unofficial'] as const).map((k) => (<button key={k} onClick={() => setIncome(k)} className={pbtn(income === k) + ' flex-1'}>{k === 'official' ? T.official : T.unofficial}</button>))}</div>
                    </div>
                    <div className={box}>
                      <div className="flex justify-between mb-3"><label className="text-white/50 text-xs font-bold uppercase tracking-wider">{T.down}</label>{!selected && <span className="text-accent font-black text-sm">{nf(mDownAmount)}</span>}</div>
                      <div className="flex gap-2 flex-wrap">{[15, 25].map((d) => (<button key={d} onClick={() => setMDown(d)} className={pbtn(mDown === d)}>{d}%</button>))}<input type="number" min={0} max={90} value={mDown} onChange={(e) => setMDown(Math.min(90, Math.max(0, Number(e.target.value))))} className="w-16 h-10 rounded-xl bg-white/10 text-white text-center font-bold text-sm outline-none" /></div>
                    </div>
                    <div className={box}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{T.term}</label>
                      <div className="flex gap-2 flex-wrap">{[12, 24, 36, 84].map((m) => (<button key={m} onClick={() => setMonths(m)} className={pbtn(months === m)}>{m}</button>))}<input type="number" min={1} max={360} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-16 h-10 rounded-xl bg-white/10 text-white text-center font-bold text-sm outline-none" /></div>
                    </div>
                    <div className={box}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{T.rate}</label>
                      <input type="number" min={0} max={40} step={0.5} value={mRate} onChange={(e) => setMRate(Number(e.target.value))} className="w-full bg-transparent text-white text-2xl font-black outline-none" />
                    </div>
                    <div className={box}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{T.loan}</label>
                      <div className="text-white text-2xl font-black">{selected ? (srvReady ? nf(srv!.remaining) : '…') : nf(loan)}</div>
                    </div>
                    <div className={`${box} sm:col-span-2`}>
                      <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{T.payType}</label>
                      <div className="flex gap-2">{(['annuity', 'diff'] as const).map((k) => (<button key={k} onClick={() => setPayType(k)} className={pbtn(payType === k) + ' flex-1'}>{k === 'annuity' ? T.annuity : T.diff}</button>))}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Natija */}
              <div className="bg-white rounded-3xl p-6 flex flex-col shadow-2xl">
                {selected ? (
                  <>
                    <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">{T.hMonthly}</div>
                    <div className="text-xs text-gray-400 mb-3 truncate">№{selected.number} · {selected.rooms} {T.xona} · {selected.area} m²</div>
                    <div className="text-3xl font-black text-primary tracking-tight mb-5">{srvReady ? nf(srv!.monthly) : '…'} <span className="text-lg text-gray-400">UZS</span></div>
                    <div className="space-y-3 border-t-2 border-gray-100 pt-5 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.hDownRow}</span><span className="font-black text-primary">{srvReady ? nf(srv!.downAmount) : '…'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{selTerm} {T.mo} {T.hSum}</span><span className="font-black text-primary">{srvReady ? nf(srv!.monthly * selTerm) : '…'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.hMortRow}</span><span className="font-black text-primary">{srvReady ? nf(srv!.remaining) : '…'}</span></div>
                    </div>
                  </>
                ) : mode === 'hybrid' ? (
                  <>
                    <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">{T.hMonthly}</div>
                    <div className="text-xs text-gray-400 mb-3">{T.hMonthlyHint}</div>
                    <div className="text-3xl font-black text-primary tracking-tight mb-5">{nf(hInstallMonthly)} <span className="text-lg text-gray-400">UZS</span></div>
                    <div className="space-y-3 border-t-2 border-gray-100 pt-5 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.hDownRow}</span><span className="font-black text-primary">{nf(hDownAmount)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.hMortRow}</span><span className="font-black text-primary">{nf(hRemaining)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.hTermRow}</span><span className="font-black text-primary">{hInstallMonths} {T.mo}</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-3">{T.mMonthly}</div>
                    <div className="text-3xl font-black text-primary tracking-tight mb-5">{nf(monthly)} <span className="text-lg text-gray-400">UZS</span></div>
                    <div className="space-y-3 border-t-2 border-gray-100 pt-5 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.totalPay}</span><span className="font-black text-primary">{nf(totalPay)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.total}</span><span className="font-black text-primary">{nf(grandTotal)}</span></div>
                    </div>
                  </>
                )}
                <a href={`/${lang}#contact`} className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-accent/30"><Phone size={16} /> {T.consult}</a>
                <div className="mt-4 flex gap-2 items-start text-[11px] text-gray-400 leading-relaxed"><Info size={14} className="min-w-3.5 text-accent mt-0.5" /><span>{T.note}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
