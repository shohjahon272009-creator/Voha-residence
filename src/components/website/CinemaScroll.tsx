'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';

/*
  Kino-scroll: ekran "qotib" turadi (sticky), foydalanuvchi scroll qilgan sari
  /cinema/frames/NNN.webp kadrlari canvas'da almashadi — kamera bino atrofida uchadi.
  Kadrlar faqat bo'lim yaqinlashganda yuklanadi (birinchi kadr darhol).
  Yangi video: public/cinema/hero.mp4 ni almashtirib, kadrlarni ffmpeg bilan qayta chiqaring.
*/

const FRAME_COUNT = 60;
// Gorizontal ekran — 1920px gorizontal kadrlar; vertikal (telefon) — 640x1072 vertikal qirqim.
// Kenglik bo'yicha emas, yo'nalish bo'yicha: aks holda kichik gorizontal oynada vertikal kadr cho'zilib xira chiqadi
const wantsHD = () => window.innerWidth >= window.innerHeight;
const frameSrc = (i: number, hd: boolean) => `/cinema/${hd ? 'frames-hd' : 'frames'}/${String(i + 1).padStart(3, '0')}.webp`;
const EASE = [0.22, 1, 0.36, 1] as const;

type Chapter = { kicker: string; title: string; text: string };
const CHAPTERS: Record<Locale, Chapter[]> = {
  uz: [
    { kicker: '"Sokin Makon"', title: 'Al-Xorazmiy haykali yonida', text: "Urganch City markazi — universitet, maktab, bog'cha va sport majmualari yoningizda." },
    { kicker: 'Tabiat', title: '10 gektar yashil hudud', text: "Favvorali sayr yo'laklari, gulzorlar va dam olish maskanlari — har kuni bog'da yashagandek." },
    { kicker: "Suv bo'yi", title: "Kanal bo'yidagi sayr yo'laklari", text: "Favvoralar, ko'priklar va salqin suv bo'yi — oilaviy sayr uchun eng yaxshi joy." },
    { kicker: 'Sizning uyingiz', title: 'Kelajak shu yerdan boshlanadi', text: 'Qavat, xona va narxni tanlang — qolganini biz hal qilamiz.' },
  ],
  ru: [
    { kicker: '«Sokin Makon»', title: 'Рядом с памятником аль-Хорезми', text: 'Центр Urganch City — университет, школа, детсад и спорткомплексы рядом с вами.' },
    { kicker: 'Природа', title: '10 гектаров зелени', text: 'Аллеи с фонтанами, цветники и зоны отдыха — каждый день как в парке.' },
    { kicker: 'У воды', title: 'Набережная вдоль канала', text: 'Фонтаны, мостики и прохлада воды — лучшее место для семейных прогулок.' },
    { kicker: 'Ваш дом', title: 'Будущее начинается здесь', text: 'Выберите этаж, комнаты и цену — остальное мы возьмём на себя.' },
  ],
  en: [
    { kicker: '"Sokin Makon"', title: 'Next to the Al-Khwarizmi monument', text: 'The heart of Urgench City — university, school, kindergarten and sports facilities nearby.' },
    { kicker: 'Nature', title: '10 hectares of green', text: 'Fountain promenades, flower beds and places to relax — like living in a park.' },
    { kicker: 'Waterfront', title: 'Canal-side promenades', text: 'Fountains, bridges and cool water — the best place for family walks.' },
    { kicker: 'Your home', title: 'The future starts here', text: "Choose the floor, rooms and price — we'll take care of the rest." },
  ],
};
const CTA: Record<Locale, string> = { uz: "Xonadonlarni ko'rish", ru: 'Смотреть квартиры', en: 'View apartments' };

// Har bob scroll'ning o'z oralig'ida paydo bo'lib, keyin yo'qoladi
function ChapterBlock({ ch, i, total, progress, lang }: { ch: Chapter; i: number; total: number; progress: MotionValue<number>; lang: Locale }) {
  const span = 1 / total;
  const a = i * span, b = a + span;
  const last = i === total - 1;
  const inR = [a, a + span * 0.25];
  const outR = [b - span * 0.25, b];
  const opacity = useTransform(progress, last ? [inR[0], inR[1]] : [inR[0], inR[1], outR[0], outR[1]], last ? [0, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, last ? [inR[0], inR[1]] : [inR[0], inR[1], outR[0], outR[1]], last ? [60, 0] : [60, 0, 0, -60]);
  const align = last ? 'items-center text-center mx-auto' : i % 2 === 0 ? 'items-start text-left' : 'items-end text-right ml-auto';

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-x-0 ${last ? 'inset-y-0 flex items-center' : 'bottom-[14%] md:bottom-[16%]'} px-6 md:px-16 pointer-events-none`}
    >
      <div className={`flex flex-col max-w-2xl w-full ${align}`}>
        <div className="flex items-center gap-3 mb-3 md:mb-4 text-accent text-[10px] md:text-xs uppercase tracking-[0.35em] font-bold">
          <span className="font-bebas text-2xl md:text-3xl tracking-normal leading-none">{String(i + 1).padStart(2, '0')}</span>
          <span className="h-px w-8 bg-accent/60" />
          {ch.kicker}
        </div>
        <h2 className={`font-montserrat font-extrabold text-white leading-[1.02] tracking-[-0.02em] ${last ? 'text-4xl md:text-7xl' : 'text-3xl md:text-6xl'}`} style={{ textShadow: '0 6px 40px rgba(0,0,0,0.5)' }}>
          {ch.title}
        </h2>
        <p className="mt-3 md:mt-5 text-white/80 text-sm md:text-lg leading-relaxed max-w-lg">{ch.text}</p>
        {last && (
          <Link href={`/${lang}/apartments`} className="pointer-events-auto group mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-primary font-bold shadow-[0_10px_40px_rgba(209,142,91,0.5)] hover:bg-white transition-colors duration-500">
            {CTA[lang]}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function CinemaScroll({ lang }: { lang: Locale }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>(Array(FRAME_COUNT).fill(null));
  const current = useRef(0);
  const [loaded, setLoaded] = useState(0);

  // Progress (0..1) to'g'ridan-to'g'ri bo'lim pozitsiyasidan — framer useScroll(target) Lenis bilan
  // ba'zan eskirgan o'lchovni ishlatardi, bu esa har doim aniq.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      scrollYProgress.set(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [scrollYProgress]);
  const chapters = CHAPTERS[lang] || CHAPTERS.uz;

  const draw = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Hali yuklanmagan bo'lsa — eng yaqin yuklangan kadrni chizamiz
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < FRAME_COUNT && !img; d++) {
      const cand = imgs.current[index - d] || imgs.current[index + d];
      if (cand?.complete && cand.naturalWidth) img = cand;
    }
    if (!img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Kattalashtirishda eng yuqori sifatli interpolyatsiya — kadrlar tiniq ko'rinadi
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  // Canvas o'lchami (retina uchun DPR, lekin 2 dan oshirmaymiz)
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      // 2x yetarli tiniq; 3x telefonda har scroll qadamida 2.25 baravar ko'p piksel chizib, sahifani qotirardi
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(current.current);
    };
    resize();
    // Canvas o'lchami har doim haqiqiy ko'rinadigan o'lchamga teng bo'lsin (telefonda manzil satri
    // yashirilganda, burilganda) — aks holda eski kichik canvas cho'zilib, rasm xira chiqadi
    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener('resize', resize);
    return () => { ro.disconnect(); window.removeEventListener('resize', resize); };
  }, []);

  // Kadrlarni yuklash: birinchisi darhol, qolganlari bo'lim yaqinlashganda
  useEffect(() => {
    const hd = wantsHD();
    const load = (i: number) => {
      if (imgs.current[i]) return;
      const im = new Image();
      im.decoding = 'async';
      im.src = frameSrc(i, hd);
      im.onload = () => {
        setLoaded((n) => n + 1);
        if (Math.abs(i - current.current) <= 2) draw(current.current);
      };
      imgs.current[i] = im;
    };
    load(0);
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      // Avval har 4-kadr (tez "eskiz"), keyin qolganlari — scroll darhol jonli ko'rinadi
      for (let i = 0; i < FRAME_COUNT; i += 4) load(i);
      for (let i = 0; i < FRAME_COUNT; i++) load(i);
      io.disconnect();
    }, { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))));
    if (idx === current.current) return;
    current.current = idx;
    requestAnimationFrame(() => draw(idx));
  });

  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const fadeIn = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const darken = useTransform(scrollYProgress, [0.75, 1], [0.05, 0.45]);

  return (
    <section ref={sectionRef} className="relative h-[380vh] md:h-[440vh] bg-[#011f1f]" aria-label={chapters[0].title}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <motion.div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: darken }} />
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {/* Hero'dan silliq o'tish */}
        <motion.div className="absolute inset-0 bg-primary pointer-events-none" style={{ opacity: fadeIn }} />

        {chapters.map((ch, i) => (
          <ChapterBlock key={i} ch={ch} i={i} total={chapters.length} progress={scrollYProgress} lang={lang} />
        ))}

        {/* O'ng tomonda progress chizig'i */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-40 md:h-56 w-px bg-white/15">
          <motion.div className="absolute inset-x-0 top-0 h-full bg-accent origin-top" style={{ scaleY: railScale }} />
          {chapters.map((_, i) => (
            <span key={i} className="absolute -left-[3px] w-[7px] h-[7px] rounded-full border border-accent bg-[#011f1f]" style={{ top: `${(i / (chapters.length - 1)) * 100}%`, transform: 'translateY(-50%)' }} />
          ))}
        </div>

        {/* Kadrlar yuklanayotganini bildiruvchi ingichka chiziq */}
        {loaded < FRAME_COUNT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute left-0 bottom-0 h-[2px] bg-accent/70"
            style={{ width: `${(loaded / FRAME_COUNT) * 100}%` }}
          />
        )}
      </div>
    </section>
  );
}
