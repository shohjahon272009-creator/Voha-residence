/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Locale } from '@/lib/dictionaries';
import AnimatedReveal from './AnimatedReveal';
import VohaLogo from '@/components/common/VohaLogo';
import { ShieldCheck, Clock, Award, Wallet } from 'lucide-react';

export default function AboutSection({ lang, settings }: { lang: Locale; settings: Record<string, string> }) {
  const t = ({
    uz: {
      tag: 'BIZ HAQIMIZDA',
      title: 'Zamonaviy va ishonchli', accent: 'qurilish',
      desc: "Biz yillar tajribasi asosida O'zbekiston bozorida xalqaro standartlarga javob beruvchi yirik turar-joy majmualarini barpo etib kelmoqdamiz.",
      s1v: '15 yil', s1l: 'Tajriba', s2v: '50+', s2l: 'Barpo etilgan loyihalar', s3v: '2500+', s3l: 'Baxtli oilalar',
      a: [
        { i: Award, t: 'Xalqaro sifat', d: 'Zamonaviy texnologiya va materiallar' },
        { i: ShieldCheck, t: 'Kafolat', d: 'Har bir loyihaga to‘liq kafolat' },
        { i: Clock, t: 'O‘z vaqtida', d: 'Belgilangan muddatda topshirish' },
        { i: Wallet, t: 'Qulay to‘lov', d: 'Muddatli va ipoteka imkoniyati' },
      ],
    },
    ru: {
      tag: 'О НАС',
      title: 'Современное и надёжное', accent: 'строительство',
      desc: 'На основе многолетнего опыта мы возводим современные жилые комплексы, соответствующие международным стандартам.',
      s1v: '15 лет', s1l: 'Опыта', s2v: '50+', s2l: 'Построенных проектов', s3v: '2500+', s3l: 'Счастливых семей',
      a: [
        { i: Award, t: 'Международное качество', d: 'Современные технологии и материалы' },
        { i: ShieldCheck, t: 'Гарантия', d: 'Полная гарантия на каждый проект' },
        { i: Clock, t: 'В срок', d: 'Сдача точно в срок' },
        { i: Wallet, t: 'Удобная оплата', d: 'Рассрочка и ипотека' },
      ],
    },
    en: {
      tag: 'ABOUT US',
      title: 'Modern and reliable', accent: 'construction',
      desc: "Based on years of experience, we build modern residential complexes that meet international standards.",
      s1v: '15 yrs', s1l: 'Experience', s2v: '50+', s2l: 'Projects built', s3v: '2500+', s3l: 'Happy families',
      a: [
        { i: Award, t: 'International quality', d: 'Modern technology and materials' },
        { i: ShieldCheck, t: 'Warranty', d: 'Full warranty on every project' },
        { i: Clock, t: 'On time', d: 'Delivered on schedule' },
        { i: Wallet, t: 'Easy payment', d: 'Installment and mortgage options' },
      ],
    },
  } as const)[lang] || ({} as never);

  const title = settings.about_title;
  const desc = settings.about_desc || t.desc;
  const s1v = settings.about_stat1_value || t.s1v;
  const s1l = settings.about_stat1_label || t.s1l;
  const s2v = settings.about_stat2_value || t.s2v;
  const s2l = settings.about_stat2_label || t.s2l;

  return (
    <section id="about" className="py-28 md:py-36 px-6 bg-brand-mesh-lux relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent z-0" />
      <div className="absolute -bottom-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-container grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        {/* Rasm */}
        <AnimatedReveal direction="left" className="relative">
          <div className="aspect-[4/5] rounded-[44px] overflow-hidden border-[14px] border-white shadow-2xl relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
            <img src="/voha-actual-bg.png" alt="Voha Residence" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          <div className="absolute -bottom-10 -right-8 w-72 h-72 bg-accent rounded-[44px] -z-0 opacity-30 transform rotate-6" />
          {/* Floating stat badge */}
          <div className="absolute -bottom-6 left-6 z-20 bg-white rounded-3xl shadow-2xl px-7 py-5 flex items-center gap-4">
            <div className="text-4xl font-black text-primary">{t.s3v}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider leading-tight">{t.s3l}</div>
          </div>
        </AnimatedReveal>

        {/* Matn */}
        <AnimatedReveal direction="right">
          <span className="eyebrow mb-5">{t.tag}</span>
          <div className="mb-6"><VohaLogo isScrolled={true} className="w-52 sm:w-60 h-auto" /></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-8 leading-[1.05]">
            {title ? title : <>{t.title} <span className="text-gradient-accent">{t.accent}</span></>}
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed font-medium max-w-xl">{desc}</p>

          {/* Statistika */}
          <div className="grid grid-cols-2 gap-6 mb-10 max-w-md">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-accent/5">
              <div className="text-4xl font-black text-primary mb-1 tracking-tight">{s1v}</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{s1l}</div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-accent/5 border-l-4 border-accent">
              <div className="text-4xl font-black text-accent mb-1 tracking-tight">{s2v}</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{s2l}</div>
            </div>
          </div>

          {/* Ustunliklar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.a.map((adv, i) => (
              <div key={i} className="group flex items-start gap-3 bg-white/70 backdrop-blur rounded-2xl p-4 border border-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center shrink-0 transition-colors duration-300">
                  <adv.i className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <div className="font-bold text-primary text-sm">{settings[`about_adv${i + 1}_title`] || adv.t}</div>
                  <div className="text-xs text-gray-500 leading-snug">{settings[`about_adv${i + 1}_desc`] || adv.d}</div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
