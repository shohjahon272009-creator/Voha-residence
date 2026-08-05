/* eslint-disable @next/next/no-img-element */
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import AnimatedReveal from '@/components/website/AnimatedReveal';
import VohaLogo from '@/components/common/VohaLogo';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';
import {
  Award, ShieldCheck, Clock, Wallet, Building2, MapPin,
  CheckCircle2, Phone, ArrowRight,
} from 'lucide-react';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';
  const phone = settings.contact_phone || '+998 91 011 66 66';

  const content: Record<Locale, {
    tag: string; title: string; accent: string; tail: string; desc: string;
    stat1value: string; stat1label: string; stat2value: string; stat2label: string;
    badgeValue: string; badgeLabel: string;
    valuesTag: string; valuesTitle: string; valuesDesc: string;
    values: { i: React.ComponentType<{ className?: string }>; t: string; d: string }[];
    missionTag: string; missionTitle: string; missionText: string; missionPoints: string[];
    ctaTitle: string; ctaDesc: string; ctaBtn: string;
  }> = {
    uz: {
      tag: 'BIZ HAQIMIZDA', title: 'Zamonaviy va ishonchli ', accent: 'qurilish', tail: '',
      desc: "15 yildan ortiq tajribamiz davomida Xorazm bo'ylab 50 dan ortiq zamonaviy turar-joy majmuasini barpo etdik. Minglab oila bizning uylarimizda orzuidagi hayotni topdi. Har bir binomiz — mustahkam sifat, o'z vaqtida topshirish va zamonaviy me'morchilik uyg'unligi.",
      stat1value: '15 yil', stat1label: 'Tajriba', stat2value: '50+', stat2label: 'Barpo etilgan loyihalar',
      badgeValue: '2500+', badgeLabel: 'Baxtli oila',
      valuesTag: 'NIMA UCHUN BIZ', valuesTitle: 'Ishonch bilan tanlanadigan qurilishchi',
      valuesDesc: 'Har bir loyihamiz ortida — sifat, halollik va o‘z vaqtida topshirish turadi.',
      values: [
        { i: Award, t: 'Xalqaro sifat', d: 'Zamonaviy texnologiya va tekshirilgan materiallar' },
        { i: ShieldCheck, t: 'To‘liq kafolat', d: 'Har bir bino va xonadonga rasmiy kafolat' },
        { i: Clock, t: 'O‘z vaqtida', d: 'Belgilangan muddatda, kechikishlarsiz topshirish' },
        { i: Wallet, t: 'Qulay to‘lov', d: 'Muddatli to‘lov va ipoteka imkoniyatlari' },
        { i: Building2, t: 'Zamonaviy arxitektura', d: 'Estetik va funksional me’moriy yechimlar' },
        { i: MapPin, t: 'Qulay joylashuv', d: 'Shahar infratuzilmasiga yaqin hududlar' },
      ],
      missionTag: 'BIZNING MAQSAD', missionTitle: 'Har bir oila uchun ishonchli uy',
      missionText: 'Biz shunchaki bino qurmaymiz — oilalar uchun yillar davomida xizmat qiladigan mustahkam va zamonaviy makon yaratamiz. Maqsadimiz — mijoz ishonchini har bir g‘ishtda oqlash.',
      missionPoints: ['Mustahkam va sifatli qurilish', 'Shaffof shartnoma va narxlar', 'Doimiy mijozlar bilan aloqa'],
      ctaTitle: 'Kelajakdagi uyingizni biz bilan tanlang',
      ctaDesc: 'Mutaxassislarimiz siz uchun eng mos xonadonni tanlashda yordam beradi.',
      ctaBtn: 'Bog‘lanish',
    },
    ru: {
      tag: 'О НАС', title: 'Современное и надёжное ', accent: 'строительство', tail: '',
      desc: 'За более чем 15 лет опыта мы построили свыше 50 современных жилых комплексов по всему Хорезму. Тысячи семей обрели дом своей мечты. Каждый проект — это надёжное качество, сдача точно в срок и современная архитектура.',
      stat1value: '15 лет', stat1label: 'Опыта', stat2value: '50+', stat2label: 'Построенных проектов',
      badgeValue: '2500+', badgeLabel: 'Счастливых семей',
      valuesTag: 'ПОЧЕМУ МЫ', valuesTitle: 'Застройщик, которому доверяют',
      valuesDesc: 'За каждым нашим проектом — качество, честность и сдача точно в срок.',
      values: [
        { i: Award, t: 'Международное качество', d: 'Современные технологии и проверенные материалы' },
        { i: ShieldCheck, t: 'Полная гарантия', d: 'Официальная гарантия на каждое здание и квартиру' },
        { i: Clock, t: 'Точно в срок', d: 'Сдача в установленный срок, без задержек' },
        { i: Wallet, t: 'Удобная оплата', d: 'Рассрочка и ипотека' },
        { i: Building2, t: 'Современная архитектура', d: 'Эстетичные и функциональные решения' },
        { i: MapPin, t: 'Удобное расположение', d: 'Районы рядом с городской инфраструктурой' },
      ],
      missionTag: 'НАША ЦЕЛЬ', missionTitle: 'Надёжный дом для каждой семьи',
      missionText: 'Мы не просто строим здания — мы создаём прочное и современное пространство, которое служит семьям долгие годы. Наша цель — оправдывать доверие клиента в каждом кирпиче.',
      missionPoints: ['Прочное и качественное строительство', 'Прозрачные договоры и цены', 'Постоянная связь с клиентами'],
      ctaTitle: 'Выберите будущий дом вместе с нами',
      ctaDesc: 'Наши специалисты помогут подобрать идеальную квартиру для вас.',
      ctaBtn: 'Связаться',
    },
    en: {
      tag: 'ABOUT US', title: 'Modern and reliable ', accent: 'construction', tail: '',
      desc: 'Over more than 15 years, we have built 50+ modern residential complexes across Khorezm. Thousands of families have found their dream home in our buildings. Every project blends solid quality, on-time delivery, and modern architecture.',
      stat1value: '15 yrs', stat1label: 'Experience', stat2value: '50+', stat2label: 'Projects built',
      badgeValue: '2500+', badgeLabel: 'Happy families',
      valuesTag: 'WHY US', valuesTitle: 'A builder you can trust',
      valuesDesc: 'Behind every project stands quality, honesty and on-time delivery.',
      values: [
        { i: Award, t: 'International quality', d: 'Modern technology and tested materials' },
        { i: ShieldCheck, t: 'Full warranty', d: 'Official warranty on every building and apartment' },
        { i: Clock, t: 'On time', d: 'Delivered on schedule, no delays' },
        { i: Wallet, t: 'Easy payment', d: 'Installment and mortgage options' },
        { i: Building2, t: 'Modern architecture', d: 'Aesthetic and functional design solutions' },
        { i: MapPin, t: 'Great location', d: 'Areas close to city infrastructure' },
      ],
      missionTag: 'OUR MISSION', missionTitle: 'A reliable home for every family',
      missionText: 'We don’t just build buildings — we create solid, modern spaces that serve families for years. Our mission is to earn our clients’ trust in every single brick.',
      missionPoints: ['Solid, high-quality construction', 'Transparent contracts and pricing', 'Continuous communication with clients'],
      ctaTitle: 'Choose your future home with us',
      ctaDesc: 'Our specialists will help you find the perfect apartment.',
      ctaBtn: 'Get in touch',
    },
  };
  const c = content[localeLang] || content.uz;

  // Admin-configurable overrides (uz)
  const useSet = localeLang === 'uz';
  const desc = useSet && settings.about_desc ? settings.about_desc : c.desc;
  const stat1value = useSet && settings.about_stat1_value ? settings.about_stat1_value : c.stat1value;
  const stat1label = useSet && settings.about_stat1_label ? settings.about_stat1_label : c.stat1label;
  const stat2value = useSet && settings.about_stat2_value ? settings.about_stat2_value : c.stat2value;
  const stat2label = useSet && settings.about_stat2_label ? settings.about_stat2_label : c.stat2label;

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      {/* ============ Intro ============ */}
      <section id="about" className="pt-36 md:pt-40 pb-24 px-6 bg-brand-mesh-lux relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-container grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <AnimatedReveal direction="left" className="relative">
            <div className="aspect-[4/5] rounded-[44px] overflow-hidden border-[14px] border-white shadow-2xl relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
              <img src="/voha-actual-bg.png" alt="Voha Residence" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            <div className="absolute -bottom-10 -right-8 w-72 h-72 bg-accent rounded-[44px] -z-0 opacity-30 transform rotate-6" />
            <div className="absolute -bottom-6 left-6 z-20 bg-white rounded-3xl shadow-2xl px-7 py-5 flex items-center gap-4">
              <div className="text-4xl font-black text-primary">{c.badgeValue}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider leading-tight max-w-[6rem]">{c.badgeLabel}</div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal direction="right">
            <span className="eyebrow mb-5">{c.tag}</span>
            <div className="mb-6"><VohaLogo isScrolled={true} className="w-52 sm:w-60 lg:w-64 h-auto" /></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-8 leading-[1.05]">
              {useSet && settings.about_title
                ? settings.about_title
                : <>{c.title}<span className="text-gradient-accent">{c.accent}</span>{c.tail}</>}
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed font-medium max-w-xl">{desc}</p>

            <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-accent/5">
                <div className="text-4xl font-black text-primary mb-1 tracking-tight">{stat1value}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{stat1label}</div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-accent/5 border-l-4 border-accent">
                <div className="text-4xl font-black text-accent mb-1 tracking-tight">{stat2value}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{stat2label}</div>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* ============ Qadriyatlar / Why us ============ */}
      <section className="py-24 md:py-28 px-6 bg-[#FDFBF7] bg-dots-light relative">
        <div className="max-container relative z-10">
          <AnimatedReveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow eyebrow--center mb-5">{c.valuesTag}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-5 leading-tight">{c.valuesTitle}</h2>
            <p className="text-gray-600 text-lg font-medium">{c.valuesDesc}</p>
          </AnimatedReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.values.map((v, i) => (
              <AnimatedReveal key={i} direction="up" delay={i * 0.08}>
                <div className="group h-full bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary flex items-center justify-center mb-6 transition-colors duration-300">
                    <v.i className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-primary text-lg mb-2">{v.t}</h3>
                  <p className="text-gray-500 leading-relaxed">{v.d}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Maqsad / Mission (dark band) ============ */}
      <section className="py-24 md:py-28 px-6 bg-primary bg-grid relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="max-container grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center relative z-10">
          <AnimatedReveal direction="left" className="relative">
            <div className="aspect-[5/4] rounded-[40px] overflow-hidden border-[12px] border-white/10 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <img src="/voha-actual-bg.png" alt="Voha Residence" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-7 -left-6 bg-white rounded-3xl shadow-2xl px-8 py-6 flex items-center gap-3">
              <Building2 className="w-9 h-9 text-accent" />
              <div className="text-sm font-black text-primary leading-tight">{companyName}</div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal direction="right">
            <span className="eyebrow mb-5">{c.missionTag}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">{c.missionTitle}</h2>
            <p className="text-white/70 text-lg mb-9 leading-relaxed font-medium max-w-xl">{c.missionText}</p>
            <ul className="space-y-4">
              {c.missionPoints.map((p, i) => (
                <li key={i} className="flex items-center gap-4 text-white/90 text-lg font-medium">
                  <span className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </AnimatedReveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20 md:py-24 px-6 bg-brand-mesh-lux">
        <div className="max-container">
          <AnimatedReveal direction="up">
            <div className="relative overflow-hidden rounded-[40px] bg-white shadow-2xl shadow-accent/10 border border-black/5 px-8 py-14 md:px-16 md:py-16 text-center">
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 leading-tight">{c.ctaTitle}</h2>
                <p className="text-gray-600 text-lg mb-9 font-medium">{c.ctaDesc}</p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-3 bg-accent hover:bg-primary text-white font-bold text-lg px-9 py-4 rounded-2xl shadow-lg shadow-accent/25 hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  {c.ctaBtn}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <div className="mt-5 text-primary font-black text-xl tracking-wide">{phone}</div>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>
    </WebsiteLayout>
  );
}
