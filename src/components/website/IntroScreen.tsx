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
      <span className="vi-corner vi-tl" />
      <span className="vi-corner vi-tr" />
      <span className="vi-corner vi-bl" />
      <span className="vi-corner vi-br" />
      <svg className="vi-bld" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax meet">
        <line className="vi-ground" x1="90" y1="512" x2="1110" y2="512" pathLength={1} />
        <g><Building /></g>
        <g transform="translate(1200,0) scale(-1,1)"><Building /></g>
      </svg>

      <div className="vi-center">
        <VohaLogo isScrolled={false} className="vi-logo" />
        <div className="vi-divider">
          <span className="vi-dln" />
          <span className="vi-dia" />
          <span className="vi-dln" />
        </div>
        <div className="vi-welcome">
          {Array.from('Xush kelibsiz!').map((ch, i) => (
            <span key={i} className="vi-ch" style={{ animationDelay: `${1.6 + i * 0.06}s` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span className="vi-caret">|</span>
        </div>
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
        .vi-corner {
          position: absolute; width: 40px; height: 40px; border: 0 solid #D18E5B;
          opacity: 0; animation: vi-corner 1s ease 0.2s forwards; pointer-events: none;
        }
        .vi-tl { top: 26px; left: 26px; border-top-width: 1.5px; border-left-width: 1.5px; }
        .vi-tr { top: 26px; right: 26px; border-top-width: 1.5px; border-right-width: 1.5px; }
        .vi-bl { bottom: 26px; left: 26px; border-bottom-width: 1.5px; border-left-width: 1.5px; }
        .vi-br { bottom: 26px; right: 26px; border-bottom-width: 1.5px; border-right-width: 1.5px; }
        .vi-divider { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
        .vi-dln {
          height: 1px; width: 0; background: #D18E5B; opacity: 0.7;
          animation: vi-grow 0.8s ease 1.2s forwards;
        }
        .vi-dia {
          width: 7px; height: 7px; background: #D18E5B; transform: rotate(45deg);
          opacity: 0; animation: vi-fade 0.5s ease 1.35s forwards;
        }
        .vi-welcome {
          margin-top: 14px; display: flex; align-items: baseline;
          color: #FBF6EE; font-weight: 500; font-size: 36px;
          letter-spacing: 0.5px; line-height: 1.1;
        }
        .vi-ch { display: inline-block; opacity: 0; animation: vi-ch 0.3s ease forwards; }
        .vi-caret { color: #D18E5B; font-weight: 400; margin-left: 3px; animation: vi-blink 0.8s step-end 1.6s infinite; }
        @keyframes vi-draw { to { stroke-dashoffset: 0; } }
        @keyframes vi-win { to { opacity: 1; } }
        @keyframes vi-ch { to { opacity: 1; } }
        @keyframes vi-blink { 50% { opacity: 0; } }
        @keyframes vi-corner { to { opacity: 0.55; } }
        @keyframes vi-grow { to { width: 55px; } }
        @keyframes vi-fade { to { opacity: 1; } }
        @keyframes vi-logo {
          0% { opacity: 0; transform: translateY(8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .vi-logo { width: 220px; }
          .vi-welcome { font-size: 24px; }
          .vi-bld { height: 56%; }
        }
      `}</style>
    </div>
  );
}
