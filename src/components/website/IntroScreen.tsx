'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import VohaLogo from '@/components/common/VohaLogo';

/*
  Kino uslubidagi kirish ekrani (faqat bosh sahifa, sessiyada BIR marta):
  1) logo maska ostidan ko'tariladi, 00→100 hisoblagich va bronza chiziq o'sadi
  2) "parda" ikki bo'lakka ajralib ochiladi — orqada hero video allaqachon o'ynayapti
  Tugagach `voha:intro-done` hodisasi yuboriladi (Hero animatsiyalari shundan boshlanadi).
*/

declare global {
  interface Window { __introDone?: boolean }
}

const WELCOME: Record<string, string> = { uz: 'Xush kelibsiz', ru: 'Добро пожаловать', en: 'Welcome' };
const HOLD = 1700;   // logo + hisoblagich
const OPEN = 900;    // parda ochilishi

export function finishIntro() {
  if (window.__introDone) return;
  window.__introDone = true;
  window.dispatchEvent(new Event('voha:intro-done'));
}

// Kirish pardasi ochildimi — Hero va boshqalar shunga qarab animatsiyani boshlaydi
const subscribe = (cb: () => void) => {
  window.addEventListener('voha:intro-done', cb);
  return () => window.removeEventListener('voha:intro-done', cb);
};
export function useIntroDone(): boolean {
  return useSyncExternalStore(subscribe, () => Boolean(window.__introDone), () => false);
}

export default function IntroScreen() {
  const pathname = usePathname();
  const match = pathname.match(/^\/(uz|ru|en)\/?$/);
  const isHome = pathname === '/' || Boolean(match);
  const lang = match?.[1] || 'uz';

  const [phase, setPhase] = useState<'idle' | 'open' | 'done'>('idle');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isHome) { finishIntro(); return; }
    let seen = false;
    try { seen = sessionStorage.getItem('voha_intro') === '1'; } catch { /* ignore */ }
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishIntro();
      const raf = requestAnimationFrame(() => setPhase('done'));
      return () => cancelAnimationFrame(raf);
    }
    try { sessionStorage.setItem('voha_intro', '1'); } catch { /* ignore */ }

    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (HOLD - 200));
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t1 = setTimeout(() => { setPhase('open'); finishIntro(); }, HOLD);
    const t2 = setTimeout(() => {
      setPhase('done');
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
    }, HOLD + OPEN);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2);
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
    };
  }, [isHome]);

  // 'idle' (SSR va birinchi kadr) ham pardani chizadi — sahifa "yalt" etib ko'rinib qolmasin
  if (!isHome || phase === 'done') return null;

  const open = phase === 'open';

  return (
    <div className={`vx${open ? ' vx--open' : ''}`} aria-hidden="true">
      <div className="vx-half vx-top" />
      <div className="vx-half vx-bot" />

      <div className="vx-center">
        <div className="vx-mask">
          <VohaLogo isScrolled={false} className="vx-logo" />
        </div>
        <div className="vx-line"><span style={{ transform: `scaleX(${count / 100})` }} /></div>
        <div className="vx-welcome">{WELCOME[lang]}</div>
      </div>

      <div className="vx-count font-bebas">{String(count).padStart(3, '0')}</div>
      <div className="vx-meta">Urganch · Xorazm</div>

      <style jsx global>{`
        .vx { position: fixed; inset: 0; z-index: 9999; pointer-events: auto; }
        .vx--open { pointer-events: none; }
        .vx-half {
          position: absolute; left: 0; right: 0; height: 50.5%; background: #012f2f;
          transition: transform ${OPEN}ms cubic-bezier(0.77, 0, 0.18, 1);
        }
        .vx-top { top: 0; background: linear-gradient(180deg, #011f1f, #014242); }
        .vx-bot { bottom: 0; background: linear-gradient(0deg, #011f1f, #014242); }
        .vx--open .vx-top { transform: translateY(-101%); }
        .vx--open .vx-bot { transform: translateY(101%); }

        .vx-center {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 0 16px;
          transition: opacity 0.45s ease, transform ${OPEN}ms cubic-bezier(0.77, 0, 0.18, 1);
        }
        .vx--open .vx-center { opacity: 0; transform: scale(1.15); }
        .vx-mask { overflow: hidden; padding: 4px 0; }
        .vx-logo {
          width: min(380px, 74vw); height: auto; display: block;
          transform: translateY(105%); animation: vx-rise 1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
        }
        .vx-line { width: min(380px, 74vw); height: 1px; background: rgba(209,142,91,0.2); margin-top: 22px; overflow: hidden; }
        .vx-line span { display: block; height: 100%; background: #D18E5B; transform-origin: left; }
        .vx-welcome {
          margin-top: 18px; color: rgba(251,246,238,0.75); font-size: 12px; letter-spacing: 0.5em;
          text-transform: uppercase; opacity: 0; animation: vx-fade 0.8s ease 0.7s forwards; padding-left: 0.5em;
        }
        .vx-count {
          position: absolute; right: 28px; bottom: 18px; color: #D18E5B; font-size: clamp(56px, 9vw, 120px);
          line-height: 1; opacity: 0.9; transition: opacity 0.3s;
        }
        .vx-meta {
          position: absolute; left: 28px; bottom: 30px; color: rgba(251,246,238,0.5);
          font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase;
        }
        .vx--open .vx-count, .vx--open .vx-meta { opacity: 0; }
        @keyframes vx-rise { to { transform: translateY(0); } }
        @keyframes vx-fade { to { opacity: 1; } }
        @media (max-width: 640px) {
          .vx-count { right: 16px; bottom: 12px; }
          .vx-meta { left: 16px; bottom: 22px; font-size: 9px; }
        }
      `}</style>
    </div>
  );
}
