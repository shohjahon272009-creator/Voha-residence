'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Calculator, Info, Phone, X, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApartmentPayment, PayResult } from '@/lib/paymentActions';
import { SelectedApartment } from '@/lib/types';

// Kalkulyator BLOKKA qarab avtomatik hisoblaydi (gibrid yoki ipoteka) — server hal qiladi.
// Narx mijozga yuborilmaydi. Ipoteka bloklarida (10,11) boshlang'ich va muddat tanlanadi.
export default function MortgageCalculator({
  lang,
  selected = null,
  onClearSelected,
}: {
  lang: Locale;
  selected?: SelectedApartment | null;
  onClearSelected?: () => void;
  terms?: unknown;
}) {
  const [downTier, setDownTier] = useState(15); // ipoteka boshlang'ich %
  const [years, setYears] = useState(5); // ipoteka muddati (yil)
  const [srv, setSrv] = useState<(PayResult & { aptId: number }) | null>(null);

  useEffect(() => {
    if (!selected) { setSrv(null); return; }
    const aptId = selected.id;
    let cancelled = false;
    getApartmentPayment(aptId, { downPct: downTier, years }).then((res) => {
      if (!cancelled && res) setSrv({ ...res, aptId });
    });
    return () => { cancelled = true; };
  }, [selected, downTier, years]);

  const nf = (x: number) => Math.round(x).toLocaleString('ru-RU');
  const ready = !!(selected && srv && srv.aptId === selected.id);

  const T = ({
    uz: { tag: 'TO‘LOV KALKULYATORI', selApt: 'Tanlangan xonadon', xona: 'xona', prompt: 'To‘lovni ko‘rish uchun yuqoridan xonadonni tanlang', monthly: 'Oylik to‘lov', downRow: 'Boshlang‘ich to‘lov', remRow: 'Qoldiq summa', termRow: 'Muddat', mo: 'oy', yr: 'yil', down: 'Boshlang‘ich (%)', term: 'Muddat (yil)', rate: 'Foiz', mortgage: 'Ipoteka', hybrid: 'Muddatli (0%)', consult: 'Konsultatsiya', note: '* Dastlabki hisob. Yakuniy shartlar loyihaga bog‘liq.' },
    ru: { tag: 'КАЛЬКУЛЯТОР ОПЛАТЫ', selApt: 'Выбранная квартира', xona: 'комн.', prompt: 'Выберите квартиру выше, чтобы увидеть оплату', monthly: 'Ежемесячный платёж', downRow: 'Первый взнос', remRow: 'Остаток', termRow: 'Срок', mo: 'мес', yr: 'лет', down: 'Взнос (%)', term: 'Срок (лет)', rate: 'Ставка', mortgage: 'Ипотека', hybrid: 'Рассрочка (0%)', consult: 'Консультация', note: '* Предварительный расчёт. Условия зависят от проекта.' },
    en: { tag: 'PAYMENT CALCULATOR', selApt: 'Selected apartment', xona: 'rooms', prompt: 'Select an apartment above to see the payment', monthly: 'Monthly payment', downRow: 'Down payment', remRow: 'Remaining', termRow: 'Term', mo: 'mo', yr: 'yr', down: 'Down (%)', term: 'Term (yr)', rate: 'Rate', mortgage: 'Mortgage', hybrid: 'Installment (0%)', consult: 'Consultation', note: '* Preliminary calculation. Terms depend on the project.' },
  } as const)[lang] || ({} as never);

  const isMort = ready && srv!.mode === 'mortgage';
  const pill = (on: boolean) => `px-4 h-10 rounded-xl font-bold text-sm transition-all ${on ? 'bg-accent text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`;

  return (
    <section id="calculator" className="py-16 px-6 scroll-mt-20">
      <div className="max-container">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="bg-primary rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg"><Calculator className="text-white" size={24} /></div>
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">{T.tag}</span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {ready ? (srv!.mode === 'mortgage' ? T.mortgage : T.hybrid) : T.tag}
                </h2>
              </div>
            </div>

            {!selected ? (
              // Xonadon tanlanmagan — yo'riqnoma
              <div className="flex flex-col items-center justify-center text-center py-14 text-white/70">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4"><MousePointerClick size={30} className="text-accent" /></div>
                <p className="font-medium max-w-sm">{T.prompt}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chap: tanlangan xonadon + (ipoteka bo'lsa) sozlamalar */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">{T.selApt}</div>
                      <div className="text-white text-lg font-black truncate">№{selected.number} · {selected.rooms} {T.xona} · {selected.area} m²</div>
                      {selected.projectName && <div className="text-white/40 text-xs truncate">{selected.projectName}</div>}
                    </div>
                    <button type="button" onClick={onClearSelected} aria-label="Bekor qilish" className="w-9 h-9 shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><X size={16} /></button>
                  </div>

                  {isMort && (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{T.down}</label>
                        <div className="flex gap-2">{[15, 25, 30].map((d) => (<button key={d} onClick={() => setDownTier(d)} className={pill(downTier === d) + ' flex-1'}>{d}%</button>))}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{T.term}</label>
                        <div className="flex gap-2 flex-wrap">{[3, 5, 10, 15, 20].map((y) => (<button key={y} onClick={() => setYears(y)} className={pill(years === y)}>{y} {T.yr}</button>))}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* O'ng: natija */}
                <div className="bg-white rounded-3xl p-6 flex flex-col shadow-2xl">
                  <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">{T.monthly}</div>
                  <div className="text-3xl font-black text-primary tracking-tight mb-5">{ready ? nf(srv!.monthly) : '…'} <span className="text-lg text-gray-400">UZS</span></div>
                  <div className="space-y-3 border-t-2 border-gray-100 pt-5 mb-6">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{T.downRow}</span><span className="font-black text-primary">{ready ? nf(srv!.downAmount) : '…'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{T.termRow}</span><span className="font-black text-primary">{ready ? (srv!.mode === 'mortgage' ? `${srv!.months / 12} ${T.yr}` : `${srv!.months} ${T.mo}`) : '…'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{T.remRow}</span><span className="font-black text-primary">{ready ? nf(srv!.remaining) : '…'}</span></div>
                    {ready && srv!.mode === 'mortgage' && srv!.rate != null && (
                      <div className="flex justify-between text-sm"><span className="text-gray-500">{T.rate}</span><span className="font-black text-primary">{srv!.rate}%</span></div>
                    )}
                  </div>
                  <a href={`/${lang}#contact`} className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-accent/30"><Phone size={16} /> {T.consult}</a>
                  <div className="mt-4 flex gap-2 items-start text-[11px] text-gray-400 leading-relaxed"><Info size={14} className="min-w-3.5 text-accent mt-0.5" /><span>{T.note}</span></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
