'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/*
  Butun sayt bo'ylab kino-paydo bo'lish — har bir komponentni alohida o'zgartirmasdan.
  Ekrandan PASTDAGI sarlavhalar (h2), rasmlar va grid kartalariga data-cine="pending"
  qo'yiladi; ekranga kirganda "in" bo'ladi (CSS o'tishlari globals.css'da), tugagach "done".
  Faqat data-atribut va transition-delay o'zgaradi — React DOM tuzilmasiga tegmaydi.
  Istisno: data-cine-skip ichidagi, hero/kino bo'limlari, modal va kichik elementlar.
*/

const SELECTOR = [
  'main h2',
  'main img',
  'main .grid > *',
].join(',');

function eligible(el: HTMLElement): boolean {
  if (el.dataset.cine) return false;
  if (el.closest('[data-cine-skip], .fixed, [role="dialog"], canvas, video, nav, form')) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 60 || r.height < 24) return false;
  // Allaqachon ko'rinib turganini yashirmaymiz (sakrash bo'lmasin)
  if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return false;
  return true;
}

export default function CinemaEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.dataset.cine = 'in';
        // O'tish tugagach atributni "done" ga o'tkazamiz — hover effektlari yana ishlasin
        setTimeout(() => { el.dataset.cine = 'done'; el.style.removeProperty('transition-delay'); }, 1900);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    const scan = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
      const gridIndex = new Map<Element, number>();
      for (const el of els) {
        if (!eligible(el)) continue;
        // Bir grid ichidagi kartalar navbatma-navbat chiqadi
        if (el.parentElement?.classList.contains('grid')) {
          const n = gridIndex.get(el.parentElement) ?? 0;
          gridIndex.set(el.parentElement, n + 1);
          el.style.setProperty('transition-delay', `${Math.min(n, 6) * 0.09}s`);
        }
        el.dataset.cine = 'pending';
        io.observe(el);
      }
    };

    // Kontent kech yuklanishi mumkin (rasm, klient komponentlar) — bir necha marta skanerlaymiz
    const timers = [60, 600, 1600].map((ms) => setTimeout(scan, ms));
    let pending = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(scan);
    });
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(pending);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
