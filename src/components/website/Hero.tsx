'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/dictionaries';
import VohaLogo from '@/components/common/VohaLogo';
import { responsive } from '@/lib/responsiveImg';
import { useIntroDone, finishIntro } from './IntroScreen';
import { onQuestLinkClick } from '@/lib/goToQuest';

type HeroSlide = { image: string; name: string; id: number; city?: string };

/*
  Bosh sahifa hero — loyihalarning haqiqiy rasmlari slayderi (AI videodan oldingi ko'rinish qaytarildi:
  video'da bino haqiqiysidan farq qilardi). Rasmlar 5 soniyada almashadi: sekin fade + Ken Burns
  (faqat transform — blur yo'q, rasm tiniq qoladi).
  • "nfull-*" renderlari (bino buzilgan) slayderga kiritilmaydi.
  • Birinchi rasm darhol (yuqori ustuvorlik), qolganlari navbati kelganda yuklanadi.
*/

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 5000;

// DB'da rasm qolmasa — tekshirilgan tiniq haqiqiy rasmlar
const FALLBACK_IMAGES = [
  '/uploads/majmua-1.jpg',
  '/uploads/blok6-1.jpg',
  '/uploads/voha-goybu-2.jpg',
  '/uploads/sariq-1.jpg',
  '/uploads/yashil-1.jpg',
];

const isGood = (src?: string | null) => Boolean(src) && !String(src).includes('nfull');

// "15 Yil" -> 15 dan sanaydi, "5000+" -> 5000 dan; raqam bo'lmasa matn o'zi qoladi
function CountUp({ value, start }: { value: string; start: boolean }) {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!m || !start || !inView) return;
    const ctrl = animate(0, Number(m[2]), { duration: 2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, inView]);
  if (!m) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{m[1]}{n}{m[3]}</span>;
}

export default function Hero({ lang, heroTitle, heroDesc, images = [], slides, settings = {} }: { lang: Locale, companyName?: string, heroTitle?: string, heroDesc?: string, images?: string[], slides?: HeroSlide[], settings?: Record<string, string> }) {
  const dict = getDictionary(lang);

  // Slayd ro'yxati: loyiha rasmlari (nfull'siz) -> oddiy rasmlar -> zaxira ro'yxat
  const fromSlides = (slides || []).filter((s) => isGood(s.image));
  const fromImages = images.filter(isGood).map((im) => ({ image: im, name: '', id: 0, city: '' }));
  const slideList: HeroSlide[] =
    fromSlides.length > 0
      ? fromSlides
      : fromImages.length > 0
        ? fromImages
        : FALLBACK_IMAGES.map((im) => ({ image: im, name: '', id: 0, city: '' }));

  const [current, setCurrent] = useState(0);
  // Qaysi slaydgacha yetib kelindi — faqat ko'rilgan va keyingi rasm DOM'ga qo'yiladi (yengil yuklanish)
  const [reached, setReached] = useState(0);
  if (current > reached) setReached(current); // render paytida moslash (effektsiz)
  const goTo = (i: number) => setCurrent(i);

  // Kirish pardasi ochilgach animatsiyalar boshlanadi
  const started = useIntroDone();
  useEffect(() => {
    // Zaxira: kirish ekrani biror sababdan tugamasa ham hero ko'rinsin
    const fallback = setTimeout(finishIntro, 3500);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (slideList.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slideList.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [slideList.length]);

  // Scroll: matn yuqoriga sekin ketib, xiralashadi
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const heroText: Record<Locale, { tag: string; title2: string; desc: string; btn1: string; btn2: string }> = {
    uz: {
      tag: 'Premium Toifadagi Turar-Joy Majmuasi',
      title2: 'Kelajagingiz uchun betakror maskan',
      desc: 'Mukammal arxitektura va zamonaviy yechimlar uyg\'unligi. O\'zingiz va oilangiz uchun Xorazmning eng prestijli nuqtasida chinakam qulaylikni kashf eting.',
      btn1: 'Xonadon tanlash',
      btn2: 'Uyingizni toping',
    },
    ru: {
      tag: 'Жилой Комплекс Премиум Класса',
      title2: 'Неповторимое пространство для вашего будущего',
      desc: 'Гармония совершенной архитектуры и современных решений. Откройте для себя истинный комфорт в самой престижной точке Хорезма.',
      btn1: 'Выбрать квартиру',
      btn2: 'Найти свою квартиру',
    },
    en: {
      tag: 'Premium Class Residential Complex',
      title2: 'A unique space for your future',
      desc: 'The harmony of perfect architecture and modern solutions. Discover true comfort in the most prestigious location of Khorezm.',
      btn1: 'Choose an apartment',
      btn2: 'Find your home',
    },
  };
  const t = heroText[lang] || heroText.uz;
  const titleText = (lang === 'uz' && heroTitle) ? heroTitle : t.title2;

  const stats: Record<Locale, Array<{label: string; value: string}>> = {
    uz: [
      { label: 'Tajriba', value: '15 Yil' },
      { label: 'Loyiha', value: '28+' },
      { label: 'Mijoz', value: '2500+' },
      { label: 'Sifat', value: 'A\'lo' },
    ],
    ru: [
      { label: 'Опыт', value: '15 лет' },
      { label: 'Проектов', value: '28+' },
      { label: 'Клиентов', value: '2500+' },
      { label: 'Качество', value: 'Отличное' },
    ],
    en: [
      { label: 'Experience', value: '15 Years' },
      { label: 'Projects', value: '28+' },
      { label: 'Clients', value: '2500+' },
      { label: 'Quality', value: 'Excellent' },
    ],
  };
  const baseStats = stats[lang] || stats.uz;
  // Admin sozlagan statistika (bo'sh bo'lsa — standart qiymat)
  const currentStats = baseStats.map((s, i) => ({
    // Admin sozlamasi o'zbekcha kiritiladi — ru/en sahifada raqam olinadi, nomi esa o'sha tilda
    // Admin qiymatida harf bo'lsa ("15 yil") — faqat uz'da; sof raqam ("28+") hamma tilda
    value: ((v) => (v && (lang === 'uz' || !/\p{L}/u.test(v)) ? v : ''))(settings[`hero_stat${i + 1}_value`]) || s.value,
    label: (lang === 'uz' && settings[`hero_stat${i + 1}_label`]) || s.label,
  }));

  const go = started ? 'show' : 'hidden';
  const active = slideList[current];

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between pt-20 pb-5 md:pb-8 bg-[#011f1f]" data-cine-skip>
      {/* Fon: loyiha rasmlari slayderi (fade + Ken Burns) */}
      <div className="absolute inset-0 z-0">
        {slideList.map((s, i) => {
          if (i > reached + 1) return null; // hali navbati kelmagan rasmlar yuklanmaydi
          const img = responsive(s.image, '100vw');
          const on = i === current;
          return (
            <div
              key={i}
              className="absolute inset-0 overflow-hidden transition-opacity duration-[2000ms] ease-in-out"
              style={{ opacity: on ? 1 : 0 }}
              aria-hidden={!on}
            >
              <img
                // key: slayd qayta faol bo'lganda Ken Burns boshidan boshlanadi
                key={on ? `on-${current}` : 'off'}
                src={img.src}
                srcSet={img.srcSet}
                sizes={img.sizes}
                alt={on ? s.name || '' : ''}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding={i === 0 ? 'sync' : 'async'}
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
                style={{ animation: on ? `${i % 2 === 0 ? 'kb-in' : 'kb-out'} 9s ease-out forwards` : 'none' }}
              />
            </div>
          );
        })}
      </div>

      {/* Qatlamlar: matn o'qilsin, lekin bino yorqin va tiniq ko'rinsin */}
      <div className="absolute inset-0 z-0 bg-black/35 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[30%] z-0 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] z-0 bg-gradient-to-t from-[#011f1f] via-[#011f1f]/60 to-transparent pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="max-container relative z-10 px-4 sm:px-6 w-full text-center flex-1 flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-4 md:mb-5 rounded-full bg-black/30 border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
          <span className="text-accent font-bold uppercase text-[9px] md:text-xs tracking-[0.28em] [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
            {t.tag}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={started ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 1, ease: EASE }}
          className="w-full max-w-[190px] sm:max-w-[240px] md:max-w-[330px] lg:max-w-[400px] mb-3 md:mb-4"
        >
          <VohaLogo isScrolled={false} className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }} />
        </motion.div>

        <motion.h1
          aria-label={titleText}
          initial="hidden"
          animate={go}
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } }}
          className="font-montserrat text-2xl md:text-4xl lg:text-5xl text-white font-bold mb-2 md:mb-3 max-w-3xl tracking-tight leading-[1.08]"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45), 0 3px 14px rgba(0,0,0,0.35)' }}
        >
          {titleText.split(' ').map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.25em]" aria-hidden="true">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: '110%' },
                  show: { y: '0%', transition: { duration: 1, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
          className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-5 max-w-2xl leading-relaxed px-4"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.3)' }}
        >
          {lang === 'uz' && heroDesc ? heroDesc : t.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2"
        >
          {/* Asosiy CTA — xaridorni darhol xonadonlarga olib boradi */}
          <a href={`/${lang}/apartments`} className="group px-6 md:px-10 py-3 md:py-4 bg-accent text-primary font-bold rounded-full hover:bg-white transition-all hover:-translate-y-1 shadow-[0_10px_40px_rgba(209,142,91,0.45)] tracking-wide inline-flex items-center gap-2 text-sm md:text-base">
            {t.btn1}
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a href={`/${lang}#uy-tanlash`} onClick={onQuestLinkClick} className="group px-6 md:px-10 py-3 md:py-4 bg-black/30 text-white font-bold rounded-full border-2 border-white/40 hover:bg-white hover:text-primary transition-all hover:-translate-y-1 inline-flex items-center gap-2 text-sm md:text-base">
            {t.btn2}
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </motion.div>

      {/* Joriy slayd yozuvi — loyiha nomi + shahar, loyiha sahifasiga havola */}
      {started && active?.name && active.id > 0 && (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute top-24 md:top-28 left-4 md:left-8 z-20"
        >
          <Link
            href={`/${lang}/projects/${active.id}`}
            className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/35 border border-white/15 hover:bg-black/50 transition-colors"
          >
            <span className="text-white font-bold text-xs md:text-sm tracking-wide truncate max-w-[180px] md:max-w-none">
              {active.name}
            </span>
            {active.city && (
              <span className="hidden sm:inline-flex items-center gap-1 text-white/70 text-[11px] md:text-xs">
                <MapPin size={12} /> {active.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-accent font-bold text-[11px] md:text-xs whitespace-nowrap">
              {dict.hero.details} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      )}

      {/* Slayder indikatorlari — faol nuqta 5 soniyada asta to'ladi */}
      {slideList.length > 1 && (
        <motion.div style={{ opacity: contentOpacity }} className="relative z-20 flex justify-center items-center gap-2 mb-4">
          {slideList.map((_, i) => (
            i === current ? (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slayd ${i + 1}`}
                className="relative h-2 w-9 rounded-full bg-white/25 overflow-hidden"
              >
                <span
                  key={current}
                  className="absolute inset-0 bg-accent rounded-full origin-left"
                  style={{ animation: `slide-progress ${SLIDE_MS}ms linear forwards` }}
                />
              </button>
            ) : (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slayd ${i + 1}`}
                className="h-2 w-2 rounded-full bg-white/40 hover:bg-white/70 transition-colors duration-300"
              />
            )
          ))}
        </motion.div>
      )}

      {/* Statistika */}
      <motion.div style={{ opacity: contentOpacity }} className="w-full relative z-20">
        <div className="max-container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto border-t border-white/15">
            {currentStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={started ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.3 + i * 0.12, duration: 1, ease: EASE }}
                className="pt-4 md:pt-5 pb-1 text-center md:border-l first:border-l-0 border-white/10"
              >
                <div className="text-accent font-bebas text-3xl md:text-5xl leading-none tracking-wide [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
                  <CountUp value={stat.value} start={started} />
                </div>
                <div className="mt-1 text-white/70 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kb-in {
          0% { transform: scale(1.02) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1%); }
        }
        @keyframes kb-out {
          0% { transform: scale(1.12) translate(1.5%, 1%); }
          100% { transform: scale(1.02) translate(0, 0); }
        }
        @keyframes slide-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes kb-in { from, to { transform: none; } }
          @keyframes kb-out { from, to { transform: none; } }
        }
      `}} />
    </section>
  );
}
