'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Calculator, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MortgageCalculator({ lang }: { lang: Locale }) {
  const [price, setPrice] = useState(800000000);
  const [downPercent, setDownPercent] = useState(30);       // boshlang'ich to'lov %
  const [installPercent, setInstallPercent] = useState(20); // 0% muddatli ulush %
  const [installMonths, setInstallMonths] = useState(12);   // muddatli muddati (oy)
  const [rate, setRate] = useState(18);                     // ipoteka yillik foizi
  const [years, setYears] = useState(15);                   // ipoteka muddati (yil)

  // Ulushlar: boshlang'ich + muddatli + ipoteka = 100%. Ipoteka = qolgani.
  const mortgagePercent = Math.max(0, 100 - downPercent - installPercent);

  const downAmount = Math.round(price * (downPercent / 100));
  const installTotal = Math.round(price * (installPercent / 100));
  const mortgageAmount = Math.round(price * (mortgagePercent / 100));

  // 0% muddatli oylik to'lov (foizsiz)
  const installMonthly = installMonths > 0 ? Math.round(installTotal / installMonths) : 0;

  // Ipoteka oylik to'lovi — annuitet (amortizatsiya) formulasi
  const n = years * 12;
  const r = rate / 100 / 12;
  const mortgageMonthly = mortgageAmount > 0
    ? (r > 0
        ? Math.round((mortgageAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
        : Math.round(mortgageAmount / (n || 1)))
    : 0;

  const nf = (x: number) => x.toLocaleString();

  const t = {
    uz: {
      tag: "GIBRID TO'LOV",
      title: "Gibrid to'lov",
      desc: "To'lovni uch qismga bo'ling: boshlang'ich to'lov, qurilish davomida 0% muddatli, qolgani esa bank ipotekasi orqali.",
      price: "Xonadon narxi (UZS)",
      down: "Boshlang'ich to'lov (%)",
      install: "0% muddatli ulush (%)",
      installM: "Muddatli muddati (oy)",
      rate: "Ipoteka yillik foizi (%)",
      years: "Ipoteka muddati (yil)",
      mo: "oy", yr: "yil",
      downAmount: "Boshlang'ich to'lov:",
      installMonthly: "0% muddatli (oylik):",
      installNote: (m: number) => `${m} oy davomida, foizsiz`,
      mortgageMonthly: "Ipoteka (oylik):",
      mortgageNote: (y: number, rr: number) => `${y} yil, ${rr}% yillik`,
      mortgageAmount: "Ipoteka summasi:",
      details: "Batafsil ma'lumot olish",
      info: "Hisob-kitoblar taxminiy. Aniq shartlar loyiha va bankka qarab o'zgarishi mumkin.",
      monthlyHint: "Qurilishdan keyin oylik ipoteka",
    },
    ru: {
      tag: "ГИБРИДНАЯ ОПЛАТА",
      title: "Гибридная оплата",
      desc: "Разделите оплату на три части: первоначальный взнос, рассрочка 0% на период строительства и остаток через ипотеку банка.",
      price: "Цена квартиры (UZS)",
      down: "Первоначальный взнос (%)",
      install: "Доля рассрочки 0% (%)",
      installM: "Срок рассрочки (мес)",
      rate: "Годовая ставка ипотеки (%)",
      years: "Срок ипотеки (лет)",
      mo: "мес", yr: "лет",
      downAmount: "Первоначальный взнос:",
      installMonthly: "Рассрочка 0% (в месяц):",
      installNote: (m: number) => `в течение ${m} мес, без процентов`,
      mortgageMonthly: "Ипотека (в месяц):",
      mortgageNote: (y: number, rr: number) => `${y} лет, ${rr}% годовых`,
      mortgageAmount: "Сумма ипотеки:",
      details: "Получить подробную информацию",
      info: "Расчёты приблизительные. Точные условия зависят от проекта и банка.",
      monthlyHint: "Ежемесячная ипотека после сдачи",
    },
    en: {
      tag: "HYBRID PAYMENT",
      title: "Hybrid Payment",
      desc: "Split the payment into three parts: a down payment, a 0% installment during construction, and the rest via a bank mortgage.",
      price: "Apartment Price (UZS)",
      down: "Down Payment (%)",
      install: "0% Installment Share (%)",
      installM: "Installment Term (months)",
      rate: "Mortgage Annual Rate (%)",
      years: "Mortgage Term (years)",
      mo: "mo", yr: "yr",
      downAmount: "Down payment:",
      installMonthly: "0% Installment (monthly):",
      installNote: (m: number) => `over ${m} months, interest-free`,
      mortgageMonthly: "Mortgage (monthly):",
      mortgageNote: (y: number, rr: number) => `${y} years, ${rr}% annual`,
      mortgageAmount: "Mortgage amount:",
      details: "Get more details",
      info: "Calculations are approximate. Exact terms depend on the project and the bank.",
      monthlyHint: "Monthly mortgage after handover",
    },
  }[lang] || ({} as never);

  const Slider = ({ label, value, display, min, max, step, onChange, delay }: {
    label: string; value: number; display: string; min: number; max: number; step: number;
    onChange: (v: number) => void; delay: number;
  }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay }}>
      <div className="flex justify-between mb-3">
        <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{label}</label>
        <span className="font-black text-accent text-lg">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent outline-none hover:bg-white/20 transition-colors"
      />
    </motion.div>
  );

  return (
    <section className="py-32 px-6">
      <div className="max-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-primary rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-primary/20 relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="p-10 lg:p-16 lg:w-1/2 text-white relative z-10">
            <span className="eyebrow mb-6">{t.tag}</span>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                <Calculator className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-black tracking-tight">{t.title}</h2>
            </div>
            <p className="text-white/70 mb-10 text-base leading-relaxed font-medium">{t.desc}</p>

            <div className="space-y-7">
              <Slider label={t.price} value={price} display={nf(price)} min={300000000} max={3000000000} step={10000000} onChange={setPrice} delay={0.3} />
              <Slider label={t.down} value={downPercent} display={`${downPercent}%`} min={0} max={70} step={5} onChange={(v) => setDownPercent(Math.min(v, 100 - installPercent))} delay={0.35} />
              <Slider label={t.install} value={installPercent} display={`${installPercent}%`} min={0} max={70} step={5} onChange={(v) => setInstallPercent(Math.min(v, 100 - downPercent))} delay={0.4} />
              <Slider label={t.installM} value={installMonths} display={`${installMonths} ${t.mo}`} min={3} max={36} step={1} onChange={setInstallMonths} delay={0.45} />
              <Slider label={t.rate} value={rate} display={`${rate}%`} min={0} max={30} step={0.5} onChange={setRate} delay={0.5} />
              <Slider label={t.years} value={years} display={`${years} ${t.yr}`} min={1} max={25} step={1} onChange={setYears} delay={0.55} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center border-l border-white/10 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, type: 'spring', stiffness: 100 }}
              className="bg-white rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="text-gray-400 text-sm uppercase font-black tracking-widest mb-1">{t.mortgageMonthly}</div>
              <div className="text-xs text-gray-400 mb-3">{t.monthlyHint}</div>
              <div className="text-4xl md:text-5xl font-black text-primary mb-8 tracking-tighter">
                {nf(mortgageMonthly)} <span className="text-2xl text-gray-400 font-bold tracking-normal">UZS</span>
              </div>

              <div className="space-y-4 border-t-2 border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-start text-base">
                  <span className="text-gray-500 font-medium">{t.downAmount}</span>
                  <span className="font-black text-primary text-right">{nf(downAmount)} UZS</span>
                </div>
                <div className="flex justify-between items-start text-base">
                  <div>
                    <span className="text-gray-500 font-medium">{t.installMonthly}</span>
                    <div className="text-xs text-success font-semibold">{t.installNote(installMonths)}</div>
                  </div>
                  <span className="font-black text-primary text-right">{nf(installMonthly)} UZS</span>
                </div>
                <div className="flex justify-between items-start text-base">
                  <div>
                    <span className="text-gray-500 font-medium">{t.mortgageAmount}</span>
                    <div className="text-xs text-gray-400 font-semibold">{t.mortgageNote(years, rate)}</div>
                  </div>
                  <span className="font-black text-primary text-right">{nf(mortgageAmount)} UZS</span>
                </div>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                href={`/${lang}#contact`}
                className="block text-center w-full py-5 bg-accent text-white font-bold text-lg rounded-2xl hover:bg-opacity-90 transition-all shadow-xl shadow-accent/30"
              >
                {t.details}
              </motion.a>
              <div className="mt-6 flex gap-3 items-start text-xs text-gray-400 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl">
                <Info size={16} className="min-w-4 text-accent mt-0.5" />
                <span>{t.info}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
