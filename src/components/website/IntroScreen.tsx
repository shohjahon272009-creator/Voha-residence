'use client';

import React, { useEffect, useMemo, useState } from 'react';
import VohaLogo from '@/components/common/VohaLogo';

/*
  Saytga kirish ekrani (preloader): oq fon, markazda Voha logotipi,
  pastda perspektivali binolar bronza chiziqlar bilan CHIZILADI (animatsiya),
  bir nechta yumshoq yoniq deraza, logo tagida o'suvchi bronza chiziq.
  ~2.6 soniyadan keyin asta yo'qoladi. Faqat sahifa to'liq yuklanganda ko'rinadi.
*/

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ox = 70, ix = 340, oTop = 138, oBot = 512, iTop = 214, iBot = 470, COLS = 6, ROWS = 10;

function buildLines() {
  const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i <= COLS; i++) {
    const t = i / COLS;
    const x = lerp(ox, ix, t);
    out.push({ x1: x, y1: lerp(oTop, iTop, t), x2: x, y2: lerp(oBot, iBot, t) });
  }
  for (let j = 0; j <= ROWS; j++) {
    const t = j / ROWS;
    out.push({ x1: ox, y1: lerp(oTop, oBot, t), x2: ix, y2: lerp(iTop, iBot, t) });
  }
  return out;
}

// Yumshoq yoniq derazalar (perspektivaga mos joylashgan)
function buildWindows() {
  const cells = [[1, 2], [3, 3], [0, 4], [2, 5], [4, 4], [1, 6], [3, 7], [2, 8]];
  return cells.map(([i, j]) => {
    const fx = (i + 0.5) / COLS;
    const x = lerp(ox, ix, fx);
    const ty = lerp(oTop, iTop, fx), by = lerp(oBot, iBot, fx);
    const y = lerp(ty, by, (j + 0.5) / ROWS);
    const h = Math.max(8, ((by - ty) / ROWS) * 0.5);
    return { x: x - 7.5, y: y - h / 2, w: 15, h };
  });
}

export default function IntroScreen() {
  const [mounted, setMounted] = useState(true);
  const [out, setOut] = useState(false);
  const lines = useMemo(buildLines, []);
  const wins = useMemo(buildWindows, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setOut(true), 3400);
    const t2 = setTimeout(() => { setMounted(false); document.body.style.overflow = ''; }, 4100);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ''; };
  }, []);

  if (!mounted) return null;

  const Building = () => (
    <>
      {lines.map((l, i) => (
        <line key={`l${i}`} className="vi-ln" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          pathLength={1} style={{ animationDelay: `${0.15 + i * 0.03}s` }} />
      ))}
      {wins.map((w, i) => (
        <rect key={`w${i}`} className="vi-wn" x={w.x} y={w.y} width={w.w} height={w.h} rx={1.5}
          style={{ animationDelay: `${1.2 + i * 0.09}s` }} />
      ))}
    </>
  );

  return (
    <div className={`vi${out ? ' vi--out' : ''}`} aria-hidden="true">
      <svg className="vi-bld" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax meet">
        <line className="vi-ground" x1="90" y1="512" x2="1110" y2="512" pathLength={1} />
        <g><Building /></g>
        <g transform="translate(1200,0) scale(-1,1)"><Building /></g>
      </svg>

      <div className="vi-center">
        <VohaLogo isScrolled={false} className="vi-logo" />
        <div className="vi-underline" />
      </div>

      <style jsx global>{`
        .vi {
          position: fixed; inset: 0; z-index: 9999; background: #014242;
          display: flex; align-items: center; justify-content: center;
          opacity: 1; transition: opacity 0.7s ease;
        }
        .vi--out { opacity: 0; pointer-events: none; }
        .vi-bld { position: absolute; left: 0; bottom: 0; width: 100%; height: 72%; }
        .vi-ln {
          fill: none; stroke: #D18E5B; stroke-width: 1; opacity: 0.5;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: vi-draw 1s ease forwards;
        }
        .vi-ground {
          stroke: #D18E5B; stroke-width: 1.4; opacity: 0.55;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: vi-draw 1.1s ease 0.1s forwards;
        }
        .vi-wn { fill: #F0C48A; opacity: 0; animation: vi-win 0.6s ease forwards; }
        .vi-center {
          position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;
          transform: translateY(-4%);
        }
        .vi-logo {
          width: 320px; height: auto; display: block;
          opacity: 0; animation: vi-logo 1s ease 0.35s forwards;
        }
        .vi-underline {
          height: 2px; width: 120px; margin-top: 16px; background: #D18E5B;
          transform: scaleX(0); transform-origin: center;
          animation: vi-under 0.7s ease 1s forwards;
        }
        @keyframes vi-draw { to { stroke-dashoffset: 0; } }
        @keyframes vi-win { to { opacity: 1; } }
        @keyframes vi-under { to { transform: scaleX(1); } }
        @keyframes vi-logo {
          0% { opacity: 0; transform: translateY(8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .vi-logo { width: 220px; }
          .vi-bld { height: 56%; }
        }
      `}</style>
    </div>
  );
}
