'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/*
  Butun saytda "kino" uslubidagi silliq scroll (Lenis).
  Native scroll saqlanadi (framer-motion useScroll, sticky, IntersectionObserver ishlayveradi).
  Harakatni kamaytirishni so'ragan foydalanuvchilarda (prefers-reduced-motion) o'chiriladi.
  window.__lenis — kirish ekrani scroll'ni vaqtincha to'xtatishi uchun.
*/
declare global {
  interface Window { __lenis?: Lenis }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -80 },
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
