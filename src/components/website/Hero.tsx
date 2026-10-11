'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { useIntroDone, finishIntro } from './IntroScreen';

type HeroSlide = { image: string; name: string; id: number; city?: string };

/*
  Kino uslubidagi hero:
  • fonda /cinema/hero.mp4 (render rasmlardan kamera harakati) — kirish pardasi ochilganda
    video 1.25x dan 1x ga "tushadi"; scroll qilganda video kattalashib, matn chuqurlikka ketadi.
  • Admin sozlamada hero_video = 'false' bo'lsa yoki video yuklanmasa — loyiha rasmlari slayderi.
*/

const EASE = [0.22, 1, 0.36, 1] as const;

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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Kirish pardasi ochilgach animatsiyalar boshlanadi
  const started = useIntroDone();
  useEffect(() => {
    // Zaxira: kirish ekrani biror sababdan tugamasa ham hero ko'rinsin
    const fallback = setTimeout(finishIntro, 3500);
    return () => clearTimeout(fallback);
  }, []);

  // Ba'zi brauzerlar autoPlay'ni e'tiborsiz qoldiradi — parda ochilganda qo'lda ishga tushiramiz
  useEffect(() => {
    const v = videoRef.current;
    if (!started || !v) return;
    v.muted = true; // React 'muted'ni SSR HTML'ga yozmaydi — autoplay bloklanmasligi uchun
    v.play().catch(() => { /* jim: poster ko'rinib turadi */ });
  }, [started]);

  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = settings.hero_video !== 'false' && !videoFailed;

  // Zaxira slayder (video o'chirilganda)
  const slideList: HeroSlide[] =
    slides && slides.length > 0
      ? slides
      : images.length > 0
        ? images.map((im) => ({ image: im, name: '', id: 0, city: '' }))
        : [{ image: '/cinema/poster.jpg', name: '', id: 0, city: '' }];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (useVideo || slideList.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slideList.length), 5000);
    return () => clearInterval(id);
  }, [useVideo, slideList.length]);

  // Scroll parallaks — sahifa scrollY (px) bo'yicha: SSR va klientda bir xil boshlang'ich qiymat (0)
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.6], ['blur(0px)', 'blur(8px)']);
  const shade = useTransform(scrollYProgress, [0, 1], [0.45, 0.85]);

  const heroText: Record<Locale, { tag: string; title2: string; desc: string; btn2: string; scroll: string }> = {
    uz: {
      tag: 'Premium Toifadagi Turar-Joy Majmuasi',
      title2: 'Kelajagingiz uchun betakror maskan',
      desc: 'Mukammal arxitektura va zamonaviy yechimlar uyg\'unligi. O\'zingiz va oilangiz uchun Xorazmning eng prestijli nuqtasida chinakam qulaylikni kashf eting.',
      btn2: 'Loyiha bilan tanishish',
      scroll: 'Pastga suring',
    },
    ru: {
      tag: 'Жилой Комплекс Премиум Класса',
      title2: 'Неповторимое пространство для вашего будущего',
      desc: 'Гармония совершенной архитектуры и современных решений. Откройте для себя истинный комфорт в самой престижной точке Хорезма.',
      btn2: 'Ознакомиться с проектом',
      scroll: 'Листайте вниз',
    },
    en: {
      tag: 'Premium Class Residential Complex',
      title2: 'A unique space for your future',
      desc: 'The harmony of perfect architecture and modern solutions. Discover true comfort in the most prestigious location of Khorezm.',
      btn2: 'Explore Projects',
      scroll: 'Scroll down',
    },
  };
  const t = heroText[lang] || heroText.uz;
  const titleText = (lang === 'uz' && heroTitle) ? heroTitle : t.title2;

  const stats: Record<Locale, Array<{label: string; value: string}>> = {
    uz: [
      { label: 'Tajriba', value: '15 Yil' },
      { label: 'Loyiha', value: '15+' },
      { label: 'Mijoz', value: '5000+' },
      { label: 'Sifat', value: 'A\'lo' },
    ],
    ru: [
      { label: 'Опыт', value: '15 лет' },
      { label: 'Проектов', value: '15+' },
      { label: 'Клиентов', value: '5000+' },
      { label: 'Качество', value: 'Отличное' },
    ],
    en: [
      { label: 'Experience', value: '15 Years' },
      { label: 'Projects', value: '15+' },
      { label: 'Clients', value: '5000+' },
      { label: 'Quality', value: 'Excellent' },
    ],
  };
  const baseStats = stats[lang] || stats.uz;
  // Admin sozlagan statistika (bo'sh bo'lsa — standart qiymat)
  const currentStats = baseStats.map((s, i) => ({
    value: settings[`hero_stat${i + 1}_value`] || s.value,
    label: settings[`hero_stat${i + 1}_label`] || s.label,
  }));

  const go = started ? 'show' : 'hidden';

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between pt-20 pb-5 md:pb-8 bg-[#011f1f]">
      {/* Fon: video (yoki zaxira slayder) */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: mediaScale }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.25 }}
          animate={{ scale: started ? 1 : 1.25 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          {useVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src="/cinema/hero.mp4"
              poster="/cinema/poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoFailed(true)}
              onCanPlay={(e) => { e.currentTarget.muted = true; e.currentTarget.play().catch(() => {}); }}
            />
          ) : (
            slideList.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
                style={{ backgroundImage: `url("${s.image}")`, opacity: i === current ? 1 : 0 }}
              />
            ))
          )}
        </motion.div>
      </motion.div>

      {/* Qorong'ilashtirish + kino "vinyetka" */}
      <motion.div className="absolute inset-0 z-0 bg-black pointer-events-none" style={{ opacity: shade }} />
      <div className="absolute inset-0 z-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 z-0 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] z-0 bg-gradient-to-t from-primary via-primary/60 to-transparent pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, filter: contentBlur }}
        className="max-container relative z-10 px-4 sm:px-6 w-full text-center flex-1 flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, letterSpacing: '0.6em' }}
          animate={started ? { opacity: 1, y: 0, letterSpacing: '0.28em' } : {}}
          transition={{ duration: 1.4, ease: EASE }}
          className="inline-flex items-center gap-3 mb-5 md:mb-7 text-accent font-bold uppercase text-[9px] md:text-xs"
        >
          <span className="h-px w-8 md:w-14 bg-accent/70" />
          {t.tag}
          <span className="h-px w-8 md:w-14 bg-accent/70" />
        </motion.div>

        <motion.h1
          aria-label={titleText}
          initial="hidden"
          animate={go}
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}
          className="font-montserrat text-[clamp(2.1rem,6.2vw,5rem)] leading-[1.02] text-white font-extrabold max-w-5xl tracking-[-0.02em] mb-5 md:mb-7"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.35)' }}
        >
          {titleText.split(' ').map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.25em]" aria-hidden="true">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: '110%', rotate: 4 },
                  show: { y: '0%', rotate: 0, transition: { duration: 1.1, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
          animate={started ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ delay: 0.9, duration: 1.1, ease: EASE }}
          className="text-sm md:text-base lg:text-lg text-white/85 mb-7 md:mb-9 max-w-2xl leading-relaxed px-4"
        >
          {lang === 'uz' && heroDesc ? heroDesc : t.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.15, duration: 0.9, ease: EASE }}
          className="flex flex-wrap justify-center gap-3 md:gap-4"
        >
          <a href={`/${lang}#about`} className="group relative overflow-hidden px-7 md:px-10 py-3.5 md:py-4 bg-accent text-primary font-bold rounded-full tracking-wide inline-flex items-center gap-2 text-sm md:text-base shadow-[0_10px_40px_rgba(209,142,91,0.45)]">
            <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative">{dict.hero.details}</span>
            <ArrowRight size={17} className="relative transition-transform group-hover:translate-x-1" />
          </a>
          <a href={`/${lang}#projects`} className="group px-7 md:px-10 py-3.5 md:py-4 backdrop-blur-md bg-white/5 text-white font-bold rounded-full border border-white/30 hover:bg-white hover:text-primary transition-all duration-500 inline-flex items-center gap-2 text-sm md:text-base">
            {t.btn2}
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll ko'rsatkichi */}
      <motion.div style={{ opacity: contentOpacity }} className="hidden md:block absolute left-8 bottom-10 z-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : {}}
        transition={{ delay: 1.8, duration: 1 }}
        className="flex items-center gap-3 text-white/60 text-[10px] uppercase tracking-[0.35em]"
      >
        <span className="relative block w-px h-14 bg-white/20 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-accent animate-[scrollcue_1.8s_ease-in-out_infinite]" />
        </span>
        {t.scroll}
      </motion.div>
      </motion.div>

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
                <div className="text-accent font-bebas text-3xl md:text-5xl leading-none tracking-wide">
                  <CountUp value={stat.value} start={started} />
                </div>
                <div className="mt-1 text-white/70 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />
    </section>
  );
}
