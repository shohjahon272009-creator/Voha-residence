 
 
 
 
 
'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Calculator, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MortgageCalculator({ lang }: { lang: Locale }) {
  const [price, setPrice] = useState(800000000);
  const [initialPaymentPercent, setInitialPaymentPercent] = useState(0);
  const [months, setMonths] = useState(30);

  const initialPayment = price * (initialPaymentPercent / 100);
  const loanAmount = price - initialPayment;
  const monthlyPayment = Math.round(loanAmount / (months || 1));

  const t = {
    uz: {
      title: "Muddatli to'lov",
      desc: "Xonadon uchun to'lovlarni o'zingizga moslang: 30 oygacha bo'lib to'lash, 0% yoki 30% boshlang'ich to'lov bilan.",
      price: "Xonadon narxi (UZS)",
      initialLabel: "Boshlang'ich to'lov (%)",
      monthsLabel: "Muddati (oy)",
      months: "oy",
      monthlyLabel: "Oylik to'lov",
      initialAmount: "Boshlang'ich to'lov miqdori:",
      markup: "Ustama foizi:",
      markupVal: "0% (Foizsiz)",
      details: "Batafsil ma'lumot olish",
      info: "Hisob-kitoblar taxminiy ko'rinishga ega va bank shartlariga qarab o'zgarishi mumkin."
    },
    ru: {
      title: "Рассрочка",
      desc: "Настройте платежи за квартиру под себя: рассрочка до 30 месяцев с первоначальным взносом 0% или 30%.",
      price: "Цена квартиры (UZS)",
      initialLabel: "Первоначальный взнос (%)",
      monthsLabel: "Срок (мес)",
      months: "мес",
      monthlyLabel: "Ежемесячный платеж",
      initialAmount: "Сумма первоначального взноса:",
      markup: "Процентная ставка:",
      markupVal: "0% (Без процентов)",
      details: "Получить подробную информацию",
      info: "Расчеты носят приблизительный характер и могут меняться в зависимости от условий банка."
    },
    en: {
      title: "Installment Plan",
      desc: "Customize your apartment payments: up to 30 months installment with 0% or 30% initial payment.",
      price: "Apartment Price (UZS)",
      initialLabel: "Initial Payment (%)",
      monthsLabel: "Duration (months)",
      months: "months",
      monthlyLabel: "Monthly Payment",
      initialAmount: "Initial payment amount:",
      markup: "Interest rate:",
      markupVal: "0% (Interest-free)",
      details: "Get more details",
      info: "Calculations are approximate and may vary depending on bank conditions."
    }
  }[lang] || {
      title: "Muddatli to'lov",
      desc: "Xonadon uchun to'lovlarni o'zingizga moslang: 30 oygacha bo'lib to'lash, 0% yoki 30% boshlang'ich to'lov bilan.",
      price: "Xonadon narxi (UZS)",
      initialLabel: "Boshlang'ich to'lov (%)",
      monthsLabel: "Muddati (oy)",
      months: "oy",
      monthlyLabel: "Oylik to'lov",
      initialAmount: "Boshlang'ich to'lov miqdori:",
      markup: "Ustama foizi:",
      markupVal: "0% (Foizsiz)",
      details: "Batafsil ma'lumot olish",
      info: "Hisob-kitoblar taxminiy ko'rinishga ega va bank shartlariga qarab o'zgarishi mumkin."
  };



  return (
    <section className="py-32 px-6">
      <div className="max-container">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-primary rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-primary/20 relative"
        >
           {/* Subtle background decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

           <div className="p-10 lg:p-20 lg:w-1/2 text-white relative z-10">
              <motion.span
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.1 }}
                 className="eyebrow mb-6"
              >
                 {t.markupVal}
              </motion.span>
              <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="flex items-center gap-4 mb-8"
              >
                 <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <Calculator className="text-white" size={28} />
                 </div>
                 <h2 className="text-4xl font-black tracking-tight">{t.title}</h2>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-white/70 mb-12 text-lg leading-relaxed font-medium"
              >
                {t.desc}
              </motion.p>
              
              <div className="space-y-10">
                 <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <div className="flex justify-between mb-3">
                       <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{t.price}</label>
                       <span className="font-black text-accent text-xl">{price.toLocaleString()}</span>
                    </div>
                    <input 
                       type="range" min={300000000} max={3000000000} step={10000000}
                       value={price} onChange={(e) => setPrice(Number(e.target.value))}
                       className="w-full h-2.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent outline-none hover:bg-white/20 transition-colors"
                    />
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }}>
                    <div className="flex justify-between mb-3">
                       <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{t.initialLabel}</label>
                       <span className="font-black text-accent text-xl">{initialPaymentPercent}%</span>
                    </div>
                    <input 
                       type="range" min={0} max={90} step={5}
                       value={initialPaymentPercent} onChange={(e) => setInitialPaymentPercent(Number(e.target.value))}
                       className="w-full h-2.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent outline-none hover:bg-white/20 transition-colors"
                    />
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.6 }}>
                     <div className="flex justify-between mb-3">
                       <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{t.monthsLabel}</label>
                       <span className="font-black text-accent text-xl">{months} {t.months}</span>
                    </div>
                    <input 
                       type="range" min={1} max={30} step={1}
                       value={months} onChange={(e) => setMonths(Number(e.target.value))}
                       className="w-full h-2.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent outline-none hover:bg-white/20 transition-colors"
                    />
                 </motion.div>
              </div>
           </div>

           <div className="bg-white/5 backdrop-blur-3xl lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center border-l border-white/10 relative z-10">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 whileInView={{ opacity: 1, scale: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
                 className="bg-white rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                 
                 <div className="text-gray-400 text-sm uppercase font-black tracking-widest mb-3">{t.monthlyLabel}</div>
                 <div className="text-5xl md:text-6xl font-black text-primary mb-8 tracking-tighter">
                    {monthlyPayment.toLocaleString()} <span className="text-2xl text-gray-400 font-bold tracking-normal">UZS</span>
                 </div>
                 
                 <div className="space-y-5 border-t-2 border-gray-100 pt-8 mb-10">
                    <div className="flex justify-between text-base">
                       <span className="text-gray-500 font-medium">{t.initialAmount}</span>
                       <span className="font-black text-primary">{(price * (initialPaymentPercent / 100)).toLocaleString()} UZS</span>
                    </div>
                    <div className="flex justify-between text-base">
                       <span className="text-gray-500 font-medium">{t.markup}</span>
                       <span className="font-black text-success">{t.markupVal}</span>
                    </div>
                 </div>

                 <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
