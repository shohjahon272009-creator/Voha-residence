'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';

/*
  "Noldan — tayyor uygacha": scroll qilgan sari bino bo'sh yerdan boshlab qavatma-qavat quriladi.
  Qatlamlar (public/cinema/build, 7-blok renderidan ffmpeg bilan tayyorlangan, 1920x1080):
    empty.webp     — bino o'rnida osmon (bo'sh maydon)
    blueprint.webp — bronza chizma chiziqlari (edgedetect), screen bilan qo'shiladi
    concrete.webp  — kulrang beton karkas
    final.webp     — tayyor bino (asl render)
  Hamma qatlamlar bitta 16:9 "sahna" ichida — clip-path foizlari rasm piksellariga aniq mos keladi.
*/

const EASE = [0.22, 1, 0.36, 1] as const;
const FLOORS = 10;
// Bino chegaralari (rasm foizlarida): tom ~432px, asos ~1076px, chap 178px, o'ng 1712px
const ROOF = 40.0;
const GROUND = 99.6;
const LEFT = 9.27;
const RIGHT = 10.83;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
// Qavatma-qavat: har qavatda biroz "to'xtab", keyin silliq keyingisiga o'tadi
const stepped = (k: number) => {
  const f = clamp01(k) * FLOORS;
  const i = Math.floor(f);
  const fr = f - i;
  const s = fr < 0.5 ? 0 : smooth((fr - 0.5) / 0.5);
  return Math.min(FLOORS, i + s) / FLOORS;
};
const cutAt = (k: number) => GROUND - (GROUND - ROOF) * k;

type Stage = { name: string; desc: string };
const T: Record<string, { kicker: string; title: string; floor: string; stages: Stage[] }> = {
  uz: {
    kicker: 'Qurilish tarixi', title: 'Noldan — tayyor uygacha', floor: 'Qavat',
    stages: [
      { name: "Bo'sh yer", desc: "Hammasi Shovot kanali bo'yidagi bo'sh maydondan boshlandi." },
      { name: 'Loyiha', desc: "Me'morlar har bir qavat, arka va derazani chizib chiqdi." },
      { name: 'Karkas', desc: "Monolit beton karkas qavatma-qavat ko'tarildi — o'z beton zavodlarimizda." },
      { name: 'Fasad', desc: "Sharqona arkalar va zamonaviy fasad binoga o'z qiyofasini berdi." },
      { name: 'Tayyor', desc: 'Kalitlar egalariga — kadastr hujjatlari bilan birga.' },
    ],
  },
  ru: {
    kicker: 'История стройки', title: 'С нуля — до готового дома', floor: 'Этаж',
    stages: [
      { name: 'Пустой участок', desc: 'Всё началось с пустой площадки на берегу канала Шават.' },
      { name: 'Проект', desc: 'Архитекторы прорисовали каждый этаж, арку и окно.' },
      { name: 'Каркас', desc: 'Монолитный каркас рос этаж за этажом — на наших собственных бетонных заводах.' },
      { name: 'Фасад', desc: 'Восточные арки и современный фасад придали дому характер.' },
      { name: 'Готово', desc: 'Ключи — владельцам, вместе с кадастровыми документами.' },
    ],
  },
  en: {
    kicker: 'Construction story', title: 'From zero to a finished home', floor: 'Floor',
    stages: [
      { name: 'Empty plot', desc: 'It all began with an empty plot on the Shovot canal.' },
      { name: 'Design', desc: 'Architects drew every floor, arch and window.' },
      { name: 'Frame', desc: 'The monolithic concrete frame rose floor by floor — from our own concrete plants.' },
      { name: 'Facade', desc: 'Eastern arches and a modern facade gave the building its character.' },
      { name: 'Ready', desc: 'Keys to the owners — together with cadastre documents.' },
    ],
  },
};

// Bosqich chegaralari (scroll progress)
const STAGE_AT = [0, 0.08, 0.26, 0.5, 0.88];

function Layer({ src, style, className = '' }: { src: string; style?: React.ComponentProps<typeof motion.img>['style']; className?: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`absolute inset-0 w-full h-full object-cover select-none ${className}`}
      style={style}
    />
  );
}

/*
  Qavatma-qavat ochilish — FAQAT transform bilan (GPU): tashqi qatlam pastga, ichki rasm teng
  yuqoriga suriladi — rasm joyida turadi, ko'rinadigan oyna esa pastdan ko'tariladi.
  Avval clip-path har scroll qadamida katta rasmlarni qayta chizib, sahifani qotirardi.
  cut — kesish chizig'i (sahna balandligining %), undan yuqorisi yashirin.
*/
function Reveal({ src, cut, opacity }: { src: string; cut: MotionValue<number>; opacity?: MotionValue<number> }) {
  const outerY = useTransform(cut, (c) => `${c}%`);
  const innerY = useTransform(cut, (c) => `${-c}%`);
  return (
    <motion.div className="absolute inset-0 overflow-hidden will-change-transform" style={{ y: outerY, opacity }}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: innerY }}>
        <Layer src={src} style={{ clipPath: `inset(0% ${RIGHT}% 0% ${LEFT}%)` }} />
      </motion.div>
    </motion.div>
  );
}

export default function BuildStory({ lang }: { lang: string }) {
  const t = T[lang] || T.uz;
  const sectionRef = useRef<HTMLElement>(null);
  const p = useMotionValue(0);
  const [stage, setStage] = useState(0);
  const [floor, setFloor] = useState(0);

  // Progress — bo'lim pozitsiyasidan (CinemaScroll bilan bir xil, Lenis bilan ishonchli)
  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      p.set(total > 0 ? clamp01(-r.top / total) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [p]);

  const kBlue = useTransform(p, (v) => clamp01((v - 0.08) / 0.16));
  const kConc = useTransform(p, (v) => stepped((v - 0.26) / 0.36));
  const kFac = useTransform(p, (v) => stepped((v - 0.5) / 0.36));

  const blueCut = useTransform(kBlue, cutAt);
  const blueOpacity = useTransform(p, [0.08, 0.12, 0.6, 0.86, 0.94], [0, 1, 0.85, 0.45, 0]);
  const concCut = useTransform(kConc, cutAt);
  const facCut = useTransform(kFac, cutAt);
  const fullOpacity = useTransform(p, [0.86, 0.96], [0, 1]);
  const dim = useTransform(p, [0, 0.08, 0.26, 0.55, 0.9], [0.2, 0.62, 0.5, 0.25, 0]);
  // Beton quyilayotgan chiziq (karkas cho'qqisi) + kran
  const pourY = useTransform(kConc, (k) => `${cutAt(k)}%`);
  const pourOpacity = useTransform(p, [0.26, 0.3, 0.6, 0.64], [0, 1, 1, 0]);
  const craneY = useTransform(kConc, (k) => `${cutAt(k) - 9}%`);
  const craneOpacity = useTransform(p, [0.22, 0.28, 0.84, 0.9], [0, 1, 1, 0]);
  const pct = useTransform(p, (v) => `${Math.round(clamp01((v - 0.04) / 0.9) * 100)}%`);

  useMotionValueEvent(p, 'change', (v) => {
    let s = 0;
    STAGE_AT.forEach((at, i) => { if (v >= at) s = i; });
    setStage(s);
    setFloor(Math.round(stepped((v - 0.26) / 0.36) * FLOORS));
  });

  return (
    <section ref={sectionRef} className="relative h-[460vh] bg-[#0b1d1d]" aria-label={t.title} data-cine-skip>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {/* 16:9 sahna — ekranni "cover" qilib to'ldiradi, pastki chetiga tayanadi */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{ width: 'max(100vw, calc(100dvh * 16 / 9))', aspectRatio: '16 / 9' }}
        >
          <Layer src="/cinema/build/empty.webp" />
          <Reveal src="/cinema/build/concrete.webp" cut={concCut} />
          <Reveal src="/cinema/build/final.webp" cut={facCut} />
          <Reveal src="/cinema/build/blueprint.webp" cut={blueCut} opacity={blueOpacity} />
          <Layer src="/cinema/build/final.webp" style={{ opacity: fullOpacity }} />

          {/* Beton quyilayotgan chiziq */}
          <motion.div className="absolute inset-0 pointer-events-none will-change-transform" style={{ y: pourY, opacity: pourOpacity }}>
            <div
              className="absolute top-0 h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#F2B98A] to-transparent shadow-[0_0_24px_6px_rgba(242,185,138,0.55)]"
              style={{ left: `${LEFT}%`, right: `${RIGHT}%` }}
            />
          </motion.div>

          {/* Minorali kran (bino oldida, sahnaning 61% nuqtasida — telefonda ham ko'rinadi): ustuni yerdan karkas cho'qqisidan yuqorigacha, strelasi chapga */}
          <motion.div className="absolute inset-0 pointer-events-none will-change-transform" style={{ y: craneY, opacity: craneOpacity }}>
          <div className="absolute top-0 h-full" style={{ left: '61%', width: '0.9%' }}>
            <div className="absolute inset-0 [background:repeating-linear-gradient(45deg,#E8A33D_0_2px,transparent_2px_9px),repeating-linear-gradient(-45deg,#E8A33D_0_2px,transparent_2px_9px)] border-x-2 border-[#E8A33D]" />
            <div className="absolute top-0 right-0 h-[0.9vw] min-h-[6px] bg-[#E8A33D] origin-right" style={{ width: '2600%' }} />
            <div className="absolute top-0 left-full h-[0.9vw] min-h-[6px] w-[500%] bg-[#E8A33D]" />
            <div className="absolute top-[0.9vw] right-[1700%] w-px h-[7vh] bg-white/70" />
            <div className="absolute right-[1700%] translate-x-1/2 top-[calc(0.9vw+7vh)] w-[1.1vw] min-w-[8px] h-[0.7vw] min-h-[5px] bg-[#E8A33D] rounded-sm" />
          </div>
          </motion.div>
        </div>

        {/* Kayfiyat qatlami: boshida qorong'iroq (chizma porlaydi), oxirida to'liq yorqin */}
        <motion.div className="absolute inset-0 bg-[#062626] pointer-events-none" style={{ opacity: dim }} />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Sarlavha */}
        <div className="absolute top-24 md:top-28 left-0 right-0 px-6 md:px-12">
          <div className="max-container">
            <div className="flex items-center gap-3 text-[#F2B98A] text-[10px] md:text-xs uppercase tracking-[0.32em] font-bold mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              <span className="h-px w-10 bg-accent/80" />{t.kicker}
            </div>
            <h2 className="font-montserrat font-extrabold text-white text-[clamp(1.9rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.02em] max-w-3xl [text-shadow:0_4px_30px_rgba(0,0,0,0.55)]">
              {t.title}
            </h2>
          </div>
        </div>

        {/* Qavat hisoblagichi */}
        <div className="absolute right-6 md:right-12 top-[38%] md:top-1/3 text-right text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/70 font-bold">{t.floor}</div>
          <div className="font-bebas leading-none">
            <span className="text-6xl md:text-8xl text-white tabular-nums">{String(floor).padStart(2, '0')}</span>
            <span className="text-2xl md:text-4xl text-white/50">/{FLOORS}</span>
          </div>
          <motion.div className="mt-1 font-bebas text-xl md:text-2xl text-[#F2B98A] tracking-wider">{pct}</motion.div>
        </div>

        {/* Joriy bosqich */}
        <div className="absolute left-0 right-0 bottom-24 md:bottom-28 px-6 md:px-12">
          <div className="max-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="max-w-xl [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-bebas text-accent text-3xl md:text-4xl">{String(stage + 1).padStart(2, '0')}</span>
                  <span className="text-white font-extrabold text-2xl md:text-4xl tracking-tight">{t.stages[stage].name}</span>
                </div>
                <p className="mt-2 text-white/85 text-sm md:text-lg leading-relaxed">{t.stages[stage].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bosqichlar chizig'i */}
        <div className="absolute left-0 right-0 bottom-8 md:bottom-10 px-6 md:px-12">
          <div className="max-container flex items-center gap-2 md:gap-3">
            {t.stages.map((s, i) => (
              <div key={i} className="flex-1">
                <StageBar p={p} i={i} />
                <div className={`hidden md:block mt-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${i <= stage ? 'text-white' : 'text-white/40'}`}>
                  {s.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// i-bosqich chizig'i: shu bosqich davomida chapdan o'ngga to'ladi
function StageBar({ p, i }: { p: MotionValue<number>; i: number }) {
  const a = STAGE_AT[i];
  const b = i + 1 < STAGE_AT.length ? STAGE_AT[i + 1] : 1;
  const fill = useTransform(p, (v) => clamp01((v - a) / (b - a)));
  return (
    <div className="h-[3px] rounded-full bg-white/20 overflow-hidden">
      <motion.div className="h-full bg-accent origin-left" style={{ scaleX: fill }} />
    </div>
  );
}
