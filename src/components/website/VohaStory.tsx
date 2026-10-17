'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { ArrowUpRight, Quote } from 'lucide-react';

/*
  Kompaniyaning haqiqiy ma'lumotlari asosidagi kino-bo'limlar
  (manba: rasmiy Telegram kanali t.me/voharesidence va Instagram @voha_residence, 2026).
  - PaymentTerms  — to'lov shartlari (0% foiz, boshlang'ich 15–30%, oylik 3 mln dan)
  - Timeline      — 15 yillik tarix, gorizontal "pin" scroll
  - Testimonials  — mijozlar fikri (ismlarsiz)
  - SocialStrip   — Instagram / Telegram
*/

const EASE = [0.22, 1, 0.36, 1] as const;
type L = 'uz' | 'ru' | 'en';
const pick = <T,>(o: Record<L, T>, lang: string): T => o[(lang as L)] || o.uz;

function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, letterSpacing: '0.7em' }}
      whileInView={{ opacity: 1, letterSpacing: '0.32em' }}
      viewport={{ once: true }}
      transition={{ duration: 1.3, ease: EASE }}
      className={`flex items-center gap-3 text-[10px] md:text-xs uppercase font-bold mb-5 ${light ? 'text-accent' : 'text-accent'}`}
    >
      <span className="h-px w-10 bg-accent/70" />
      {children}
    </motion.div>
  );
}

function BigTitle({ text, light, className = '' }: { text: string; light?: boolean; className?: string }) {
  return (
    <motion.h2
      data-cine-skip
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className={`font-montserrat font-extrabold tracking-[-0.03em] leading-[1] text-[clamp(2.1rem,5.5vw,4.6rem)] ${light ? 'text-white' : 'text-primary'} ${className}`}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.22em]">
          <motion.span className="inline-block" variants={{ hidden: { y: '115%' }, show: { y: '0%', transition: { duration: 1.05, ease: EASE } } }}>
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

/* ===================== To'lov shartlari ===================== */
export function PaymentTerms({ lang }: { lang: string }) {
  const t = pick({
    uz: {
      kicker: "To'lov shartlari", title: "Bank foizisiz, o'z uyingizga",
      sub: "Ipoteka foizlariga yillab to'lash shart emas. Voha Residence'da uy olish — adolatli va oddiy.",
      items: [
        { n: 0, s: '%', label: 'Foiz', text: "Hech qanday bank foizi va ustama to'lovsiz" },
        { n: 15, s: '%', p: '', label: "Boshlang'ich to'lov", text: "1 xonali uchun 15% dan, 2 xonali — 20% dan" },
        { n: 3, s: 'mln', label: "Oylik to'lov", text: "Oyiga 3 mln so'mdan boshlanadigan qulay grafik" },
        { n: 1, s: '', label: 'Hujjat', text: "Faqat pasport — onlayn ham rasmiylashtiriladi" },
      ],
      cta: "To'lovni hisoblash",
    },
    ru: {
      kicker: 'Условия оплаты', title: 'Без банковских процентов — в свой дом',
      sub: 'Не нужно годами переплачивать по ипотеке. В Voha Residence покупка жилья честная и простая.',
      items: [
        { n: 0, s: '%', label: 'Процент', text: 'Без банковских процентов и переплат' },
        { n: 15, s: '%', label: 'Первый взнос', text: 'От 15% за 1-комнатную, от 20% за 2-комнатную' },
        { n: 3, s: 'млн', label: 'Ежемесячно', text: 'Удобный график — от 3 млн сумов в месяц' },
        { n: 1, s: '', label: 'Документ', text: 'Только паспорт — можно оформить онлайн' },
      ],
      cta: 'Рассчитать платёж',
    },
    en: {
      kicker: 'Payment terms', title: 'No bank interest — straight to your home',
      sub: 'No need to overpay a mortgage for years. Buying at Voha Residence is fair and simple.',
      items: [
        { n: 0, s: '%', label: 'Interest', text: 'No bank interest, no hidden markups' },
        { n: 15, s: '%', label: 'Down payment', text: 'From 15% for 1-room, from 20% for 2-room' },
        { n: 3, s: 'M', label: 'Monthly', text: 'Flexible plan from 3M UZS per month' },
        { n: 1, s: '', label: 'Document', text: 'Just your passport — can be done online' },
      ],
      cta: 'Calculate payment',
    },
  }, lang);

  return (
    <section className="relative overflow-hidden bg-primary py-24 md:py-36 px-6">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-accent/15 soft-blob pointer-events-none" />
      <div className="relative max-container">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20 items-end mb-14 md:mb-20" data-cine-skip>
          <div>
            <Kicker light>{t.kicker}</Kicker>
            <BigTitle text={t.title} light />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="text-white/70 text-base md:text-lg leading-relaxed max-w-md"
          >
            {t.sub}
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/15" data-cine-skip>
          {t.items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
              className="group relative pt-8 pb-10 lg:px-8 lg:first:pl-0 lg:border-l lg:first:border-l-0 border-white/10 border-b sm:border-b-0"
            >
              <div className="font-bebas text-accent leading-none whitespace-nowrap text-7xl lg:text-[5.5rem] xl:text-8xl">
                {it.n === 1 && it.s === '' ? '1' : <Counter to={it.n} suffix={it.s} />}
              </div>
              <div className="mt-3 text-white font-bold text-lg">{it.label}</div>
              <p className="mt-2 text-white/60 text-sm leading-relaxed max-w-[16rem]">{it.text}</p>
              <span className="absolute left-0 lg:left-8 lg:group-first:left-0 bottom-0 h-px w-0 bg-accent group-hover:w-1/2 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 1 }} className="mt-12">
          <Link href={`/${lang}/apartments#calculator`} className="group inline-flex items-center gap-3 text-white font-bold border-b border-accent pb-1 hover:text-accent transition-colors">
            {t.cta} <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== 15 yillik tarix ===================== */
export function Timeline({ lang }: { lang: string }) {
  const t = pick({
    uz: {
      kicker: '15 yillik tajriba', title: 'Biz qurgan yo\'l',
      items: [
        { y: '2013', h: 'Birinchi qadam', d: "5 blokli savdo majmuasining 1-bloki qurilishi boshlandi." },
        { y: '2013', h: 'Xalqaro loyiha', d: "Samsung kompaniyasining \"Gaz-kimyo kompleksi\" qurilish ishlari bo'yicha 3 yillik shartnoma." },
        { y: '2014', h: 'Namunaviy uylar', d: "Urganch tumanida 10 ta namunaviy xonadon qurilishi." },
        { y: '2015', h: 'Davlat obyektlari', d: "Strategik davlat obyektlari qurilishi va rekonstruksiyasi: universitet, hokimiyat, shifoxona, maktab, bog'cha." },
        { y: 'Arda Xiva', h: '1 yilga yetmasdan', d: "Mashhur \"Arda Xiva\" majmuasining 40% qismini kompaniyamiz 1 yilga yetmasdan topshirdi." },
        { y: 'Bugun', h: 'Voha Residence', d: "Shovot kanali bo'yidagi bloklar, \"Sokin Makon\" va \"Yangi O'zbekiston\" massivi — 200 dan ortiq oila tanlovi." },
      ],
    },
    ru: {
      kicker: '15 лет опыта', title: 'Путь, который мы построили',
      items: [
        { y: '2013', h: 'Первый шаг', d: 'Начато строительство 1-го блока торгового комплекса из 5 блоков.' },
        { y: '2013', h: 'Международный проект', d: 'Трёхлетний контракт на строительные работы «Газохимического комплекса» Samsung.' },
        { y: '2014', h: 'Типовые дома', d: 'Строительство 10 типовых домов в Ургенчском районе.' },
        { y: '2015', h: 'Гособъекты', d: 'Строительство и реконструкция стратегических объектов: университет, хокимият, больница, школа, детсад.' },
        { y: 'Arda Xiva', h: 'Меньше чем за год', d: '40% известного комплекса «Arda Xiva» наша компания сдала менее чем за год.' },
        { y: 'Сегодня', h: 'Voha Residence', d: 'Блоки у канала Шават, «Sokin Makon» и массив «Янги Узбекистан» — выбор более 200 семей.' },
      ],
    },
    en: {
      kicker: '15 years of experience', title: 'The road we built',
      items: [
        { y: '2013', h: 'First step', d: 'Construction of block 1 of a 5-block shopping complex began.' },
        { y: '2013', h: 'International project', d: "3-year contract for construction works on Samsung's Gas-Chemical Complex." },
        { y: '2014', h: 'Model homes', d: '10 model houses built in Urgench district.' },
        { y: '2015', h: 'Public buildings', d: 'Strategic state facilities: university, hokimiyat, hospital, school, kindergarten.' },
        { y: 'Arda Xiva', h: 'In under a year', d: 'Our company delivered 40% of the famous "Arda Xiva" complex in less than a year.' },
        { y: 'Today', h: 'Voha Residence', d: 'Blocks on the Shovot canal, "Sokin Makon" and "Yangi Uzbekistan" — chosen by 200+ families.' },
      ],
    },
  }, lang);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Kartalar qatori gorizontal siljiydi (desktop). Mobil'da oddiy vertikal ro'yxat.
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-62%']);
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative bg-[#FDFBF7] md:h-[300vh]" data-cine-skip>
      <div className="md:sticky md:top-0 md:h-[100dvh] overflow-hidden flex flex-col justify-center py-24 md:py-0">
        <div className="max-container px-6 w-full mb-10 md:mb-14">
          <Kicker>{t.kicker}</Kicker>
          <BigTitle text={t.title} />
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-[5.1rem] h-px bg-primary/10" />
          <motion.div className="hidden md:block absolute left-0 right-0 top-[5.1rem] h-px bg-accent origin-left" style={{ scaleX: line }} />
          <motion.div style={{ x }} className="hidden md:flex gap-8 pl-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] pr-24 w-max">
            {t.items.map((it, i) => (
              <div key={i} className="w-[24rem] shrink-0">
                <div className="font-bebas text-6xl text-primary leading-none">{it.y}</div>
                <span className="block w-3 h-3 rounded-full bg-accent ring-8 ring-[#FDFBF7] my-4" />
                <div className="text-xl font-bold text-primary mb-2">{it.h}</div>
                <p className="text-gray-600 leading-relaxed">{it.d}</p>
              </div>
            ))}
          </motion.div>
          {/* Mobil: vertikal */}
          <div className="md:hidden px-6 space-y-10 border-l border-accent/40 ml-6">
            {t.items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, ease: EASE }}
                className="relative pl-2"
              >
                <span className="absolute -left-[2.15rem] top-3 w-3 h-3 rounded-full bg-accent ring-4 ring-[#FDFBF7]" />
                <div className="font-bebas text-5xl text-primary leading-none">{it.y}</div>
                <div className="text-lg font-bold text-primary mt-2 mb-1">{it.h}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{it.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== Mijozlar fikri ===================== */
export function Testimonials({ lang }: { lang: string }) {
  const t = pick({
    uz: {
      kicker: 'Mijozlar fikri', title: "Ular allaqachon uyli bo'ldi",
      stat: [{ n: 200, s: '+', l: 'oila tanlovi' }, { n: 43, s: '', l: 'shartnoma — aksiyaning 1-kunida' }, { n: 24, s: 'K', l: 'Instagram kuzatuvchi' }],
      q: [
        { text: "Instagramda ko'rib kelgandik. 2000$ to'lab, oylik to'lovi 3 mln — haqiqat ekan. Hammaga tavsiya qilaman.", who: 'Mijozimiz, 2 xonali xonadon' },
        { text: "Taqdimotda aytilgan hamma gaplar aytilgandek bo'ldi. 2 xonali uy xarid qildim, tavsiya qilaman.", who: 'Onlayn taqdimot ishtirokchisi' },
        { text: "Asosiysi — toza shaharcha qurilayotgani va joylashuvi qulayligi. Gollandiyada turib xarid qildik.", who: 'Xorijdagi mijozimiz' },
        { text: "50 mln boshlang'ich to'lov bilan tayyor ta'mirlangan xonadon oldim. Oylik 4 mln — rost ekan.", who: '"Sokin Makon" xaridori' },
      ],
    },
    ru: {
      kicker: 'Отзывы', title: 'Они уже со своим домом',
      stat: [{ n: 200, s: '+', l: 'семей выбрали нас' }, { n: 43, s: '', l: 'договора — в 1-й день акции' }, { n: 24, s: 'K', l: 'подписчиков в Instagram' }],
      q: [
        { text: 'Увидели в Instagram. Взнос 2000$, ежемесячно 3 млн — оказалось правдой. Всем рекомендую.', who: 'Клиент, 2-комнатная квартира' },
        { text: 'Всё, что обещали на презентации, так и оказалось. Купил 2-комнатную, рекомендую.', who: 'Участник онлайн-презентации' },
        { text: 'Главное — строится чистый городок и удобное расположение. Купили, находясь в Нидерландах.', who: 'Клиент из-за рубежа' },
        { text: 'Взнос 50 млн — и готовая квартира с ремонтом. Ежемесячно 4 млн — правда.', who: 'Покупатель «Sokin Makon»' },
      ],
    },
    en: {
      kicker: 'Testimonials', title: 'They already have their home',
      stat: [{ n: 200, s: '+', l: 'families chose us' }, { n: 43, s: '', l: 'contracts on day 1 of the offer' }, { n: 24, s: 'K', l: 'Instagram followers' }],
      q: [
        { text: 'We saw it on Instagram. $2,000 down and 3M a month — it was true. I recommend it to everyone.', who: 'Client, 2-room apartment' },
        { text: 'Everything promised at the presentation came true. I bought a 2-room flat — recommended.', who: 'Online presentation attendee' },
        { text: 'What matters most is the clean new neighbourhood and the location. We bought from the Netherlands.', who: 'Client living abroad' },
        { text: '50M down for a ready, renovated apartment. 4M a month — it is real.', who: '"Sokin Makon" buyer' },
      ],
    },
  }, lang);

  return (
    <section className="relative overflow-hidden bg-[#011f1f] py-24 md:py-36 px-6" data-cine-skip>
      <div className="relative max-container">
        <Kicker light>{t.kicker}</Kicker>
        <BigTitle text={t.title} light className="max-w-4xl" />
        <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-10 border-y border-white/10 py-8 md:py-10">
          {t.stat.map((s, i) => (
            <div key={i}>
              <div className="font-bebas text-accent text-5xl md:text-8xl leading-none"><Counter to={s.n} suffix={s.s} /></div>
              <div className="mt-2 text-white/60 text-[11px] md:text-sm uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-5 md:gap-6">
          {t.q.map((q, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 60, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1.1, delay: (i % 2) * 0.12, ease: EASE }}
              className="group relative rounded-[28px] p-7 md:p-10 bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-accent/40 transition-colors duration-500"
            >
              <Quote className="text-accent/70 mb-5" size={34} />
              <blockquote className="text-white text-lg md:text-xl leading-relaxed font-medium">“{q.text}”</blockquote>
              <figcaption className="mt-6 text-white/50 text-sm flex items-center gap-3">
                <span className="h-px w-8 bg-accent/60" />{q.who}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== Ijtimoiy tarmoqlar ===================== */
export function SocialStrip({ lang }: { lang: string }) {
  const t = pick({
    uz: { kicker: 'Biz bilan qoling', title: 'Qurilish jarayoni — har kuni jonli', ig: "Instagram'da kuzating", tg: 'Telegram kanalga qo\'shiling', igS: '23,7K kuzatuvchi · aksiyalar, mijozlar, loyiha', tgS: "Onlayn taqdimotlar, chegirmalar, qurilish hisobotlari" },
    ru: { kicker: 'Оставайтесь с нами', title: 'Стройка — каждый день вживую', ig: 'Следите в Instagram', tg: 'Подпишитесь на Telegram', igS: '23,7K подписчиков · акции, клиенты, проект', tgS: 'Онлайн-презентации, скидки, отчёты о стройке' },
    en: { kicker: 'Stay with us', title: 'Construction — live, every day', ig: 'Follow on Instagram', tg: 'Join our Telegram', igS: '23.7K followers · offers, clients, project', tgS: 'Online presentations, discounts, construction reports' },
  }, lang);
  const cards = [
    { href: 'https://www.instagram.com/voha_residence', title: t.ig, sub: t.igS, handle: '@voha_residence', grad: 'from-[#f58529] via-[#dd2a7b] to-[#8134af]' },
    { href: 'https://t.me/voharesidence', title: t.tg, sub: t.tgS, handle: 't.me/voharesidence', grad: 'from-[#2AABEE] to-[#229ED9]' },
  ];
  return (
    <section className="relative bg-[#FDFBF7] py-24 md:py-32 px-6" data-cine-skip>
      <div className="max-container">
        <Kicker>{t.kicker}</Kicker>
        <BigTitle text={t.title} className="max-w-4xl" />
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <motion.a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
              className="group relative overflow-hidden rounded-[28px] p-8 md:p-10 bg-primary text-white min-h-[16rem] flex flex-col justify-between"
            >
              <span className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="relative flex items-start justify-between gap-4">
                <span className="font-bebas text-2xl tracking-widest text-accent group-hover:text-white transition-colors">{c.handle}</span>
                <span className="w-14 h-14 rounded-full border border-white/25 flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-colors duration-500">
                  <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
              <div className="relative">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">{c.title}</div>
                <div className="mt-2 text-white/70">{c.sub}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
