'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProjectVideoCard from './showcase/ProjectVideoCard';

/*
  "Loyihalarimiz jonli" — BITTA ixcham bo'lim (taxminan bir ekran):
    chapda  — kichik video karta (avvalgi hero videosi, "loyihalarimizdan biri" sifatida)
    o'ngda  — qurilish tarixi: 5 bosqich (01–05), bosish/hover bilan asosiy rasm almashadi.
  Avvalgi uzun "sticky" scroll (460vh) olib tashlandi — mehmon vaqti scroll'ga ketmasin.
  Telefonda ikki karta gorizontal surish (swipe) qatorida turadi — sahifa o'zi kengaymaydi.
  Animatsiyalar faqat opacity/transform (CLAUDE.md qoidasi).
*/

// ⚠️ VIDEO QAYSI LOYIHANI KO'RSATADI — egasi tasdiqlashi kerak. Nomni shu yerda o'zgartiring.
// (Bazada "Xorazmiy" nomli loyiha topilmadi; egasi taklif qilgan nom ishlatilmoqda.)
const VIDEO_PROJECT_NAME: Record<string, string> = {
  uz: 'Al-Xorazmiy massivi',
  ru: 'Массив Аль-Хорезми',
  en: 'Al-Khwarizmi district',
};

const AUTO_MS = 3800; // foydalanuvchi tegmaguncha bosqichlar o'zi almashadi

// Bosqich rasmlari (public/cinema/build, 2400x1350). "Loyiha" = bo'sh yer + bronza chizma (screen);
// "Fasad" = karkas ustida pastki qismi tayyor fasad (statik clip-path, animatsiyasiz).
type Layer = { src: string; className?: string; style?: React.CSSProperties };
const STAGE_LAYERS: Layer[][] = [
  [{ src: '/cinema/build/empty.webp' }],
  [{ src: '/cinema/build/empty.webp' }, { src: '/cinema/build/blueprint.webp', className: 'mix-blend-screen' }],
  [{ src: '/cinema/build/concrete.webp' }],
  [{ src: '/cinema/build/concrete.webp' }, { src: '/cinema/build/final.webp', style: { clipPath: 'inset(58% 0 0 0)' } }],
  [{ src: '/cinema/build/final.webp' }],
];

type Stage = { name: string; desc: string };
type Copy = {
  kicker: string; title: string; sub: string;
  badge: string; city: string; cta: string;
  storyKicker: string; storyTitle: string;
  stages: Stage[];
};

const T: Record<string, Copy> = {
  uz: {
    kicker: 'Qurilish jarayoni',
    title: 'Loyihalarimiz jonli',
    sub: "Bo'sh yerdan kalit topshirishgacha — hammasini o'zimiz quramiz.",
    badge: 'Loyihalarimizdan biri',
    city: 'Urganch',
    cta: "Loyihani ko'rish",
    storyKicker: 'Qurilish tarixi',
    storyTitle: 'Noldan — tayyor uygacha',
    stages: [
      { name: "Bo'sh yer", desc: "Hammasi Shovot kanali bo'yidagi bo'sh maydondan boshlandi." },
      { name: 'Loyiha', desc: "Me'morlar har bir qavat, arka va derazani chizib chiqdi." },
      { name: 'Karkas', desc: "Monolit beton karkas — o'z beton zavodlarimizda." },
      { name: 'Fasad', desc: 'Sharqona arkalar va zamonaviy fasad binoga qiyofa berdi.' },
      { name: 'Tayyor', desc: 'Kalitlar egalariga — kadastr hujjatlari bilan birga.' },
    ],
  },
  ru: {
    kicker: 'Процесс строительства',
    title: 'Наши проекты вживую',
    sub: 'От пустого участка до вручения ключей — всё строим сами.',
    badge: 'Один из наших проектов',
    city: 'Ургенч',
    cta: 'Смотреть проект',
    storyKicker: 'История стройки',
    storyTitle: 'С нуля — до готового дома',
    stages: [
      { name: 'Участок', desc: 'Всё началось с пустой площадки на берегу канала Шават.' },
      { name: 'Проект', desc: 'Архитекторы прорисовали каждый этаж, арку и окно.' },
      { name: 'Каркас', desc: 'Монолитный каркас — на наших собственных бетонных заводах.' },
      { name: 'Фасад', desc: 'Восточные арки и современный фасад придали дому характер.' },
      { name: 'Готово', desc: 'Ключи — владельцам, вместе с кадастровыми документами.' },
    ],
  },
  en: {
    kicker: 'How we build',
    title: 'Our projects, live',
    sub: 'From an empty plot to handing over the keys — we build it all ourselves.',
    badge: 'One of our projects',
    city: 'Urgench',
    cta: 'View project',
    storyKicker: 'Construction story',
    storyTitle: 'From zero to a finished home',
    stages: [
      { name: 'Empty plot', desc: 'It all began with an empty plot on the Shovot canal.' },
      { name: 'Design', desc: 'Architects drew every floor, arch and window.' },
      { name: 'Frame', desc: 'Monolithic concrete frame — from our own concrete plants.' },
      { name: 'Facade', desc: 'Eastern arches and a modern facade gave it character.' },
      { name: 'Ready', desc: 'Keys to the owners — with cadastre documents.' },
    ],
  },
};

function StageImage({ i, sizes, className = '' }: { i: number; sizes: string; className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {STAGE_LAYERS[i].map((l, k) => (
        <img
          key={k}
          src={l.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          sizes={sizes}
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover select-none ${l.className || ''}`}
          style={l.style}
        />
      ))}
    </div>
  );
}

export default function BuildStory({ lang }: { lang: string }) {
  const t = T[lang] || T.uz;
  const projectName = VIDEO_PROJECT_NAME[lang] || VIDEO_PROJECT_NAME.uz;
  const storyRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(false);

  // Avto-almashish faqat ko'rinib turganda, foydalanuvchi tegmaguncha va reduced-motion bo'lmasa
  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setVisible(e[0].isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || touched) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % STAGE_LAYERS.length), AUTO_MS);
    return () => window.clearInterval(id);
  }, [visible, touched]);

  const pick = (i: number) => { setTouched(true); setStage(i); };

  return (
    <section className="relative bg-[#011f1f] py-14 md:py-20 overflow-hidden" aria-label={t.title} data-cine-skip>
      <div className="max-container px-4 md:px-12">
        {/* Sarlavha */}
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.32em] text-[#F2B98A]">
              <span className="h-px w-10 bg-accent/80" />{t.kicker}
            </div>
            <h2 className="font-montserrat font-extrabold text-white text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em]">
              {t.title}
            </h2>
          </div>
          <p className="max-w-md text-sm md:text-base leading-relaxed text-white/70">{t.sub}</p>
        </div>

        {/* Telefonda: gorizontal swipe qatori; katta ekranda: 2 ustunli grid */}
        <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0 lg:grid lg:grid-cols-[5fr_7fr] lg:gap-6 lg:overflow-visible lg:pb-0">
          <ProjectVideoCard
            lang={lang}
            badge={t.badge}
            name={projectName}
            city={t.city}
            cta={t.cta}
            className="w-[86%] shrink-0 snap-start min-h-[440px] sm:w-[60%] lg:w-auto lg:min-h-0"
          />

          {/* Qurilish tarixi — 5 bosqich */}
          <div
            ref={storyRef}
            className="w-[86%] shrink-0 snap-start min-w-0 sm:w-[60%] lg:w-auto flex flex-col rounded-3xl bg-[#0b2a2a] ring-1 ring-white/10 overflow-hidden"
          >
            <div className="relative aspect-[16/10] lg:aspect-[16/8] w-full overflow-hidden bg-[#0b1d1d]">
              {STAGE_LAYERS.map((_, i) => (
                <StageImage
                  key={i}
                  i={i}
                  sizes="(max-width: 1023px) 86vw, 58vw"
                  className={`transition-opacity duration-700 ${i === stage ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                {t.storyKicker}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6" aria-live="polite">
                <div key={stage} className="motion-safe:animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-bebas text-2xl md:text-3xl text-accent leading-none">{String(stage + 1).padStart(2, '0')}</span>
                    <span className="text-lg md:text-2xl font-extrabold tracking-tight text-white">{t.stages[stage].name}</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm leading-relaxed text-white/85 line-clamp-2">{t.stages[stage].desc}</p>
                </div>
              </div>
            </div>

            {/* Bosqichlar: 5 ta tugma (katta ekranda kichik rasm bilan) */}
            <div className="p-3 md:p-4">
              <div className="mb-2 hidden md:block text-xs font-bold uppercase tracking-[0.2em] text-white/50">{t.storyTitle}</div>
              <div className="grid grid-cols-5 gap-1.5 md:gap-2" role="tablist" aria-label={t.storyTitle}>
                {t.stages.map((s, i) => {
                  const active = i === stage;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => pick(i)}
                      onMouseEnter={() => pick(i)}
                      onFocus={() => pick(i)}
                      className={`group/step min-w-0 text-left rounded-xl p-1.5 md:p-2 transition-colors duration-300 ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="relative hidden md:block aspect-[16/10] w-full overflow-hidden rounded-lg">
                        <StageImage i={i} sizes="140px" />
                        <div className={`absolute inset-0 ring-2 ring-inset rounded-lg transition-colors duration-300 ${active ? 'ring-accent' : 'ring-transparent'}`} />
                      </div>
                      <div className="h-[3px] md:hidden rounded-full bg-white/15 overflow-hidden">
                        <div className={`h-full bg-accent origin-left transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1 min-w-0">
                        <span className={`font-bebas text-sm md:text-base leading-none ${active ? 'text-accent' : 'text-white/45'}`}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={`truncate text-[10px] md:text-xs font-bold ${active ? 'text-white' : 'text-white/55'}`}>{s.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
