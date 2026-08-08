'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import VohaLogo from '@/components/common/VohaLogo';

/*
  Saytga kirish ekrani (preloader) — premium:
  to'q teal fon, dekorativ burchak ramkalar, markazda katta logo,
  pastda perspektivali binolar bronza chiziqlar bilan CHIZILADI + yoniq derazalar,
  logo tagida KATTA "Xush kelibsiz!" harf-harflab yoziladi. ~3.6s da asta yo'qoladi.
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

function buildWindows() {
  const cells = [[1, 2], [3, 3], [0, 4], [2, 5], [4, 4], [1, 6], [3, 7], [2, 8], [4, 7]];
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
  const pathname = usePathname();
  // "Xush kelibsiz" faqat bosh sahifada; boshqa sahifalarda faqat logo (qisqaroq)
  const isHome = pathname === '/' || /^\/(uz|ru|en)\/?$/.test(pathname);

  const [mounted, setMounted] = useState(true);
  const [out, setOut] = useState(false);
  const lines = useMemo(buildLines, []);
  const wins = useMemo(buildWindows, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isHome) return; // Kirish ekrani faqat bosh sahifada
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setOut(true), 1400);
    const t2 = setTimeout(() => { setMounted(false); document.body.style.overflow = ''; }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ''; };
  }, [isHome]);

  // Faqat bosh sahifada ko'rinadi; boshqa sahifalarda umuman chiqmaydi
  if (!isHome || !mounted) return null;

  const Building = () => (
    <>
      {lines.map((l, i) => (
        <line key={`l${i}`} className="vi-ln" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          pathLength={1} style={{ animationDelay: `${0.1 + i * 0.022}s` }} />
      ))}
      {wins.map((w, i) => (
        <rect key={`w${i}`} className="vi-wn" x={w.x} y={w.y} width={w.w} height={w.h} rx={1.5}
          style={{ animationDelay: `${0.9 + i * 0.05}s` }} />
      ))}
    </>
  );

  return (
    <div
      className={`vi${out ? ' vi--out' : ''}`}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#014242', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Dekorativ burchak ramkalar */}
      <span className="vi-corner vi-corner--tl" />
      <span className="vi-corner vi-corner--tr" />
      <span className="vi-corner vi-corner--bl" />
      <span className="vi-corner vi-corner--br" />

      <svg className="vi-bld" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax meet">
        <line className="vi-ground" x1="90" y1="512" x2="1110" y2="512" pathLength={1} />
        <g><Building /></g>
        <g transform="translate(1200,0) scale(-1,1)"><Building /></g>
      </svg>

      <div className="vi-center">
        <VohaLogo isScrolled={false} className="vi-logo" />
        {isHome && (
        <div className="vi-welcome">
          {Array.from('Xush kelibsiz!').map((ch, i) => (
            <span key={i} className="vi-ch" style={{ animationDelay: `${0.55 + i * 0.03}s` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span className="vi-caret">|</span>
        </div>
        )}
      </div>

      <style jsx global>{`
        .vi {
          position: fixed; inset: 0; z-index: 9999; background: #014242;
          display: flex; align-items: center; justify-content: center;
          opacity: 1; transition: opacity 0.7s ease;
        }
        .vi--out { opacity: 0; pointer-events: none; }

        .vi-corner {
          position: absolute; width: 60px; height: 60px;
          border-color: #D18E5B; opacity: 0;
        }
        .vi-corner--tl { top: 26px; left: 26px; border-top: 2px solid; border-left: 2px solid; animation: vi-corner 0.8s ease 0.2s forwards; }
        .vi-corner--tr { top: 26px; right: 26px; border-top: 2px solid; border-right: 2px solid; animation: vi-corner 0.8s ease 0.3s forwards; }
        .vi-corner--bl { bottom: 26px; left: 26px; border-bottom: 2px solid; border-left: 2px solid; animation: vi-corner 0.8s ease 0.3s forwards; }
        .vi-corner--br { bottom: 26px; right: 26px; border-bottom: 2px solid; border-right: 2px solid; animation: vi-corner 0.8s ease 0.4s forwards; }

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
          animation: vi-draw 1.1s ease 0.2s forwards;
        }
        .vi-wn { fill: #F0C48A; opacity: 0; animation: vi-win 0.6s ease forwards; }

        .vi-center {
          position: relative; z-index: 2; width: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; transform: translateY(-3%); padding: 0 16px;
        }
        .vi-logo {
          width: min(360px, 78vw); height: auto; display: block; margin: 0 auto;
          opacity: 0; animation: vi-logo 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }
        .vi-welcome {
          margin-top: 22px; display: inline-block; white-space: nowrap; text-align: center;
          color: #FBF6EE; font-weight: 500; font-size: 46px; max-width: 100%;
          letter-spacing: 13px; padding-left: 13px; line-height: 1.1;
        }
        .vi-ch { display: inline-block; opacity: 0; animation: vi-ch 0.35s ease forwards; }
        .vi-caret { color: #D18E5B; font-weight: 400; margin-left: 4px; animation: vi-blink 0.7s step-end 0.55s infinite; }

        @keyframes vi-corner { from { opacity: 0; transform: scale(1.35); } to { opacity: 0.55; transform: scale(1); } }
        @keyframes vi-draw { to { stroke-dashoffset: 0; } }
        @keyframes vi-win { to { opacity: 1; } }
        @keyframes vi-ch { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vi-blink { 50% { opacity: 0; } }
        @keyframes vi-logo {
          0% { opacity: 0; transform: translateY(10px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .vi-corner { width: 40px; height: 40px; }
          .vi-logo { width: 240px; }
          .vi-welcome { font-size: 26px; letter-spacing: 7px; padding-left: 7px; }
          .vi-bld { height: 56%; }
        }
      `}</style>
    </div>
  );
}
