'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Eye, FileSignature, KeyRound, ArrowRight } from 'lucide-react';

/*
  "Qanday sotib olinadi — 4 qadam". Faktlar rasmiy Telegram kanalidan:
  faqat pasport, 0% foiz, onlayn rasmiylashtirish mumkin, kadastr hujjatlari.
*/

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = [Search, Eye, FileSignature, KeyRound];

const T: Record<string, { kicker: string; title: string; steps: { h: string; d: string }[]; cta: string }> = {
  uz: {
    kicker: 'Oddiy va shaffof', title: "Uyli bo'lish — 4 qadam",
    steps: [
      { h: 'Tanlang', d: "Saytda yoki 30 soniyalik o'yinda o'zingizga mos xonadonni toping." },
      { h: "Ko'ring", d: "Ofisga keling yoki qurilish maydoniga birga boramiz — o'z ko'zingiz bilan ko'ring." },
      { h: 'Shartnoma', d: "Faqat pasport kifoya. Xohlasangiz — uydan chiqmasdan onlayn rasmiylashtiramiz." },
      { h: "Kalitni oling", d: "0% foizli bo'lib to'lash va kadastr hujjatlari bilan — uy rasman sizniki." },
    ],
    cta: 'Uyimni topish',
  },
  ru: {
    kicker: 'Просто и прозрачно', title: 'Своя квартира — 4 шага',
    steps: [
      { h: 'Выберите', d: 'Найдите подходящую квартиру на сайте или в 30-секундной игре.' },
      { h: 'Посмотрите', d: 'Приходите в офис или поедем на стройку вместе — увидите своими глазами.' },
      { h: 'Договор', d: 'Нужен только паспорт. Можно оформить онлайн, не выходя из дома.' },
      { h: 'Получите ключи', d: 'Рассрочка 0% и кадастровые документы — квартира официально ваша.' },
    ],
    cta: 'Найти мою квартиру',
  },
  en: {
    kicker: 'Simple and transparent', title: 'Your own home — 4 steps',
    steps: [
      { h: 'Choose', d: 'Find the right apartment on the site or in the 30-second game.' },
      { h: 'Visit', d: 'Come to the office or we go to the site together — see it with your own eyes.' },
      { h: 'Contract', d: 'Only your passport is needed. Can be done online from home.' },
      { h: 'Get the keys', d: '0% installments and cadastre documents — the home is officially yours.' },
    ],
    cta: 'Find my home',
  },
};

export default function BuySteps({ lang }: { lang: string }) {
  const t = T[lang] || T.uz;
  return (
    <section className="relative bg-[#FDFBF7] py-20 md:py-28 px-6" data-cine-skip>
      <div className="max-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-accent text-[10px] md:text-xs uppercase font-bold tracking-[0.32em] mb-4">
              <span className="h-px w-10 bg-accent/70" />{t.kicker}
            </div>
            <h2 className="font-montserrat font-extrabold text-primary text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]">{t.title}</h2>
          </div>
          <Link href={`/${lang}#uy-tanlash`} className="group inline-flex items-center gap-2 self-start md:self-auto px-7 py-4 rounded-full bg-primary text-white font-bold hover:bg-accent hover:text-primary transition-colors">
            {t.cta}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="hidden lg:block absolute left-[12%] right-[12%] top-9 h-px bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0" />
          {t.steps.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                className="relative rounded-3xl bg-white p-7 shadow-[0_10px_40px_rgba(1,66,66,0.07)] border border-black/5"
              >
                <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl bg-primary text-accent flex items-center justify-center shadow-lg">
                  <Icon size={30} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-primary text-xs font-black flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-primary">{s.h}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed text-[15px]">{s.d}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
