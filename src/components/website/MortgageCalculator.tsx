'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Calculator, Info, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MortgageCalculator({ lang }: { lang: Locale }) {
  const [price, setPrice] = useState(1000000000);
  const [income, setIncome] = useState<'official' | 'unofficial'>('official');
  const [downPercent, setDownPercent] = useState(15);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(18);
  const [payType, setPayType] = useState<'annuity' | 'diff'>('annuity');

  const downAmount = Math.round(price * (downPercent / 100));
  const loan = Math.max(0, price - downAmount);
  const r = rate / 100 / 12;
  const n = months || 1;

  // Annuitet: har oy bir xil
  const annuityMonthly = r > 0
    ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : loan / n;
  const annuityTotal = annuityMonthly * n;

  // Differensial: birinchi oy eng katta, keyin kamayadi
  const diffFirst = loan / n + loan * r;
  const diffLast = loan / n + (loan / n) * r;
  const diffTotal = loan + (loan * r * (n + 1)) / 2;

  const monthly = payType === 'annuity' ? annuityMonthly : diffFirst;
  const totalPay = payType === 'annuity' ? annuityTotal : diffTotal;
  const grandTotal = downAmount + totalPay;

  const nf = (x: number) => Math.round(x).toLocaleString('ru-RU');

  const t = ({
    uz: {
      tag: 'IPOTEKA KALKULYATORI', title: 'Ipoteka kalkulyatori',
      price: 'Xonadon narxi (UZS)', income: 'Daromad', official: 'Rasmiy', unofficial: 'Norasmiy',
      down: 'Boshlang‘ich to‘lov (%)', term: 'Kredit muddati (oy)', rate: 'Foiz stavkasi (%)',
      loan: 'Kredit summasi (UZS)', monthly: 'Oylik to‘lovingiz', totalPay: 'Umumiy to‘lovlar summasi',
      total: 'Jami', payType: 'Oylik to‘lov turi', annuity: 'Annuitet', diff: 'Differensial',
      consult: 'Konsultatsiya', schedule: 'To‘lov jadvali', diffNote: (a: string, b: string) => `${a} → ${b} gacha kamayadi`,
      note: '* Dastlabki hisob-kitob ma‘lumot uchun. Yakuniy shartlar bank tomonidan belgilanadi.',
      mo: 'oy',
    },
    ru: {
      tag: 'ИПОТЕЧНЫЙ КАЛЬКУЛЯТОР', title: 'Ипотечный калькулятор',
      price: 'Цена квартиры (UZS)', income: 'Доход', official: 'Официальный', unofficial: 'Неофициальный',
      down: 'Первоначальный взнос (%)', term: 'Срок кредита (мес.)', rate: 'Процентная ставка (%)',
      loan: 'Сумма кредита (UZS)', monthly: 'Ваш ежемесячный платёж', totalPay: 'Общая сумма выплат',
      total: 'Всего', payType: 'Тип платежей', annuity: 'Аннуитетные', diff: 'Дифференцированные',
      consult: 'Консультация', schedule: 'График платежей', diffNote: (a: string, b: string) => `${a} → уменьшается до ${b}`,
      note: '* Предварительный расчёт носит информационный характер. Условия определяет банк.',
      mo: 'мес',
    },
    en: {
      tag: 'MORTGAGE CALCULATOR', title: 'Mortgage calculator',
      price: 'Apartment price (UZS)', income: 'Income', official: 'Official', unofficial: 'Unofficial',
      down: 'Down payment (%)', term: 'Loan term (months)', rate: 'Interest rate (%)',
      loan: 'Loan amount (UZS)', monthly: 'Your monthly payment', totalPay: 'Total payments',
      total: 'Total', payType: 'Payment type', annuity: 'Annuity', diff: 'Differentiated',
      consult: 'Consultation', schedule: 'Payment schedule', diffNote: (a: string, b: string) => `${a} → decreases to ${b}`,
      note: '* Preliminary calculation for information only. Final terms are set by the bank.',
      mo: 'mo',
    },
  } as const)[lang] || ({} as never);

  const downPresets = [15, 25, 50];
  const termPresets = [12, 24, 36, 84];

  const fieldBox = 'bg-white/5 border border-white/10 rounded-2xl p-5';
  const presetBtn = (on: boolean) =>
    `px-4 h-10 rounded-xl font-bold text-sm transition-all ${on ? 'bg-accent text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`;

  return (
    <section className="py-28 px-6">
      <div className="max-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="bg-primary rounded-[40px] overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="text-white" size={24} />
              </div>
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">{t.tag}</span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{t.title}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* Chap: kiritmalar */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Narx */}
                <div className={fieldBox}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{t.price}</label>
                  <input
                    type="text" inputMode="numeric" value={price.toLocaleString('ru-RU')}
                    onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full bg-transparent text-white text-2xl font-black outline-none"
                  />
                </div>
                {/* Daromad */}
                <div className={fieldBox}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{t.income}</label>
                  <div className="flex gap-2">
                    {(['official', 'unofficial'] as const).map((k) => (
                      <button key={k} onClick={() => setIncome(k)} className={presetBtn(income === k) + ' flex-1'}>
                        {k === 'official' ? t.official : t.unofficial}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Boshlang'ich */}
                <div className={fieldBox}>
                  <div className="flex justify-between mb-3">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider">{t.down}</label>
                    <span className="text-accent font-black text-sm">{nf(downAmount)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {downPresets.map((d) => (
                      <button key={d} onClick={() => setDownPercent(d)} className={presetBtn(downPercent === d)}>{d}%</button>
                    ))}
                    <input type="number" min={0} max={90} value={downPercent}
                      onChange={(e) => setDownPercent(Math.min(90, Math.max(0, Number(e.target.value))))}
                      className="w-16 h-10 rounded-xl bg-white/10 text-white text-center font-bold text-sm outline-none" />
                  </div>
                </div>
                {/* Muddat */}
                <div className={fieldBox}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{t.term}</label>
                  <div className="flex gap-2 flex-wrap">
                    {termPresets.map((m) => (
                      <button key={m} onClick={() => setMonths(m)} className={presetBtn(months === m)}>{m}</button>
                    ))}
                    <input type="number" min={1} max={360} value={months}
                      onChange={(e) => setMonths(Math.min(360, Math.max(1, Number(e.target.value))))}
                      className="w-16 h-10 rounded-xl bg-white/10 text-white text-center font-bold text-sm outline-none" />
                  </div>
                </div>
                {/* Foiz */}
                <div className={fieldBox}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{t.rate}</label>
                  <input type="number" min={0} max={40} step={0.5} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full bg-transparent text-white text-2xl font-black outline-none" />
                </div>
                {/* Kredit summasi */}
                <div className={fieldBox}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{t.loan}</label>
                  <div className="text-white text-2xl font-black">{nf(loan)}</div>
                </div>
                {/* To'lov turi */}
                <div className={`${fieldBox} sm:col-span-2`}>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-3">{t.payType}</label>
                  <div className="flex gap-2">
                    {(['annuity', 'diff'] as const).map((k) => (
                      <button key={k} onClick={() => setPayType(k)} className={presetBtn(payType === k) + ' flex-1'}>
                        {k === 'annuity' ? t.annuity : t.diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* O'ng: natija */}
              <div className="bg-white rounded-3xl p-8 flex flex-col shadow-2xl">
                <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-2">{t.monthly}</div>
                <div className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-1">{nf(monthly)} <span className="text-lg text-gray-400">UZS</span></div>
                {payType === 'diff' && (
                  <div className="text-[11px] text-accent font-semibold mb-4">{t.diffNote(nf(diffFirst), nf(diffLast))}</div>
                )}
                <div className="space-y-3 border-t-2 border-gray-100 pt-5 mt-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totalPay}</span>
                    <span className="font-black text-primary">{nf(totalPay)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.total}</span>
                    <span className="font-black text-primary">{nf(grandTotal)}</span>
                  </div>
                </div>
                <a href={`/${lang}#contact`} className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-accent text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-accent/30">
                  <Phone size={16} /> {t.consult}
                </a>
                <div className="mt-4 flex gap-2 items-start text-[11px] text-gray-400 leading-relaxed">
                  <Info size={14} className="min-w-3.5 text-accent mt-0.5" />
                  <span>{t.note}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
