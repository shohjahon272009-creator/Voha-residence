'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Wallet, Info, Phone, X, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApartmentPayment, type PublicPay } from '@/lib/paymentActions';
import BookingModal from './BookingModal';
import type { Apartment } from '@/lib/types';
import { SelectedApartment } from '@/lib/types';

// To'lov kartasi: boshlang'ich to'lov (foiz yoki qat'iy summa) + xonalar soniga qarab STANDART
// oylik to'lov (server hisoblaydi, paymentCalc.ts). Narx, qolgan summa va muddat mijozga
// yuborilmaydi — "qolgan summani bilish uchun kontakt qoldiring" (BookingModal).
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
  // Aynan shu xonadon bo'yicha ariza
  const [bookOpen, setBookOpen] = useState(false);
  const [srv, setSrv] = useState<(PublicPay & { aptId: number }) | null>(null);
  // Server null qaytardi (sotilgan / limit / xato) — "…" abadiy aylanmasin
  const [failId, setFailId] = useState<number | null>(null);

  useEffect(() => {
    if (!selected) return;
    const aptId = selected.id;
    let cancelled = false;
    getApartmentPayment(aptId)
      .then((res) => {
        if (cancelled) return;
        if (res) setSrv({ ...res, aptId });
        else setFailId(aptId);
      })
      .catch(() => { if (!cancelled) setFailId(aptId); });
    return () => { cancelled = true; };
  }, [selected]);

  const nf = (x: number) => Math.round(x).toLocaleString('ru-RU');
  const ready = !!(selected && srv && srv.aptId === selected.id);
  const failed = !ready && !!selected && failId === selected.id;

  const T = ({
    uz: { tag: 'TO‘LOV TIZIMI', title: 'To‘lov shartlari', selApt: 'Tanlangan xonadon', xona: 'xona', prompt: 'To‘lovni ko‘rish uchun yuqoridan xonadonni tanlang', down: 'Boshlang‘ich to‘lov', monthly: 'Oylik to‘lov', sum: 'so‘m', perMonth: 'oyiga', agreed: 'Kelishiladi', restTitle: 'Qolgan summa', rest: 'Qolgan summani bilish uchun kontakt qoldiring', cta: 'Kontakt qoldirish', note: '* Yakuniy shartlar menejer bilan kelishiladi.' },
    ru: { tag: 'СИСТЕМА ОПЛАТЫ', title: 'Условия оплаты', selApt: 'Выбранная квартира', xona: 'комн.', prompt: 'Выберите квартиру выше, чтобы увидеть оплату', down: 'Первый взнос', monthly: 'Ежемесячный платёж', sum: 'сум', perMonth: 'в месяц', agreed: 'По договорённости', restTitle: 'Оставшаяся сумма', rest: 'Чтобы узнать оставшуюся сумму, оставьте контакт', cta: 'Оставить контакт', note: '* Окончательные условия согласовываются с менеджером.' },
    en: { tag: 'PAYMENT PLAN', title: 'Payment terms', selApt: 'Selected apartment', xona: 'rooms', prompt: 'Select an apartment above to see the payment', down: 'Down payment', monthly: 'Monthly payment', sum: 'UZS', perMonth: '/ month', agreed: 'By agreement', restTitle: 'Remaining amount', rest: 'Leave your contact to learn the remaining amount', cta: 'Leave contact', note: '* Final terms are agreed with a manager.' },
  } as const)[lang] || ({} as never);

  // "Standart: 2 xonali" kabi izoh — oylik xonalar soniga bog'liqligini tushuntiradi
  const r = selected ? Math.min(4, Math.max(1, Number(selected.rooms) || 1)) : 1;
  const rl = `${r}${r >= 4 ? '+' : ''}`;
  const stdNote = ({ uz: `${rl} xonali uchun standart`, ru: `Стандарт для ${rl}-комнатных`, en: `Standard for ${rl}-room` } as Record<string, string>)[lang] || '';

  const downText = ready
    ? (srv!.downFixed != null ? `${nf(srv!.downFixed)} ${T.sum}` : srv!.downPct != null ? `${srv!.downPct}%` : T.agreed)
    : failed ? T.agreed : '…';
  const monthlyText = ready ? nf(srv!.monthly) : failed ? T.agreed : '…';

  return (
    <section id="calculator" className="py-16 px-6 scroll-mt-20">
      <div className="max-container">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="bg-primary rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full soft-blob -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg"><Wallet className="text-white" size={24} /></div>
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">{T.tag}</span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{T.title}</h2>
              </div>
            </div>

            {!selected ? (
              // Xonadon tanlanmagan — yo'riqnoma
              <div className="flex flex-col items-center justify-center text-center py-14 text-white/70">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4"><MousePointerClick size={30} className="text-accent" /></div>
                <p className="font-medium max-w-sm">{T.prompt}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tanlangan xonadon */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">{T.selApt}</div>
                    <div className="text-white text-lg font-black truncate">№{selected.number} · {selected.rooms} {T.xona} · {selected.area} m²</div>
                    {selected.projectName && <div className="text-white/40 text-xs truncate">{selected.projectName}</div>}
                  </div>
                  <button type="button" onClick={onClearSelected} aria-label="Bekor qilish" className="w-9 h-9 shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><X size={16} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Boshlang'ich to'lov */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">1</span>{T.down}
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight" aria-live="polite">{downText}</div>
                  </div>

                  {/* 2. Oylik to'lov — xonalar soniga qarab standart */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">2</span>{T.monthly}
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight" aria-live="polite">
                      {monthlyText}
                      {ready && <span className="text-base font-bold text-white/50"> {T.sum} {T.perMonth}</span>}
                    </div>
                    {ready && <div className="text-white/40 text-xs mt-2">{stdNote}</div>}
                  </div>

                  {/* 3. Qolgan summa — faqat kontakt orqali */}
                  <div className="bg-white rounded-2xl p-5 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-wider mb-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">3</span>{T.restTitle}
                    </div>
                    <p className="text-primary font-bold leading-snug mb-4">{T.rest}</p>
                    <button type="button" onClick={() => setBookOpen(true)} className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-accent/30">
                      <Phone size={16} /> {T.cta}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 items-start text-[11px] text-white/40 leading-relaxed"><Info size={14} className="min-w-3.5 text-accent mt-0.5" /><span>{T.note}</span></div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {bookOpen && selected && (
        <BookingModal
          lang={lang}
          onClose={() => setBookOpen(false)}
          apartment={{ id: selected.id, number: selected.number, floor: selected.floor, rooms: selected.rooms, area: selected.area } as unknown as Apartment}
        />
      )}
    </section>
  );
}
