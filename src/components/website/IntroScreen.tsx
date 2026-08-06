'use client';

import React, { useEffect, useMemo, useState } from 'react';
import VohaLogo from '@/components/common/VohaLogo';

/*
  Saytga kirish ekrani (preloader): oq fon, markazda Voha logotipi,
  pastda ingichka chiziqli (blueprint) binolar. ~2 soniyadan keyin asta yo'qoladi.
  Har brauzer sessiyasida bir marta ko'rinadi (bezmasligi uchun).
*/

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Bitta binoning perspektivali chiziqlarini yasaydi (tashqi chekka baland, ichki chekka past — orqaga ketadi)
function buildingLines() {
  const ox = 70, ix = 340;        // tashqi va ichki vertikal chekka x
  const oTop = 138, oBot = 512;   // tashqi chekka balandligi
  const iTop = 214, iBot = 470;   // ichki chekka balandligi (kalta = orqada)
  const cols = 6, rows = 10;
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // Vertikal ustunlar
  for (let i = 0; i <= cols; i++) {
    const t = i / cols;
    const x = lerp(ox, ix, t);
    lines.push({ x1: x, y1: lerp(oTop, iTop, t), x2: x, y2: lerp(oBot, iBot, t) });
  }
  // Gorizontal qavatlar
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    lines.push({ x1: ox, y1: lerp(oTop, oBot, t), x2: ix, y2: lerp(iTop, iBot, t) });
  }
  return lines;
}

export default function IntroScreen() {
  const [mounted, setMounted] = useState(true);
  const [out, setOut] = useState(false);
  const lines = useMemo(buildingLines, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Faqat sahifa to'liq yuklanganda ko'rinadi (ichki o'tishlarda layout qayta yuklanmaydi).
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setOut(true), 1900);      // yo'qola boshlaydi
    const t2 = setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = '';
    }, 2600);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`voha-intro${out ? ' voha-intro--out' : ''}`} aria-hidden="true">
      <svg className="voha-intro__bld" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax meet">
        <g className="voha-intro__lines">
          {lines.map((l, i) => (
            <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
          <g transform="translate(1200,0) scale(-1,1)">
            {lines.map((l, i) => (
              <line key={`r${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
            ))}
          </g>
        </g>
      </svg>

      <div className="voha-intro__logo">
        <VohaLogo isScrolled className="voha-intro__logoSvg" />
      </div>

      <style jsx global>{`
        .voha-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.7s ease;
        }
        .voha-intro--out { opacity: 0; pointer-events: none; }
        .voha-intro__bld {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 68%;
          opacity: 0;
          animation: voha-bld-in 1.3s ease 0.15s forwards;
        }
        .voha-intro__lines line {
          fill: none;
          stroke: #014242;
          stroke-width: 1;
          opacity: 0.16;
          vector-effect: non-scaling-stroke;
        }
        .voha-intro__logo {
          position: relative;
          z-index: 2;
          transform: translateY(-6%);
          opacity: 0;
          animation: voha-logo-in 1.1s ease 0.1s forwards;
        }
        .voha-intro__logoSvg {
          width: 200px;
          height: auto;
          display: block;
        }
        @keyframes voha-logo-in {
          0% { opacity: 0; transform: translateY(-6%) scale(0.94); }
          100% { opacity: 1; transform: translateY(-6%) scale(1); }
        }
        @keyframes voha-bld-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @media (max-width: 640px) {
          .voha-intro__logoSvg { width: 150px; }
          .voha-intro__bld { height: 52%; }
        }
      `}</style>
    </div>
  );
}
