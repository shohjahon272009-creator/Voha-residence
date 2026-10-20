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

    const reveal = (el: HTMLElement) => {
      if (el.dataset.cine !== 'pending') return;
      io.unobserve(el);
      el.dataset.cine = 'in';
      // O'tish tugagach atributni "done" ga o'tkazamiz — hover effektlari yana ishlasin
      setTimeout(() => { el.dataset.cine = 'done'; el.style.removeProperty('transition-delay'); }, 1900);
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) reveal(e.target as HTMLElement);
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    // Zaxira: IntersectionObserver ba'zan o'tkazib yuboradi (sahifa almashinuvi, juda tez scroll) —
    // shunda element abadiy yashirin qolardi. Ekranga kirgan "pending"larni majburan ochamiz:
    // scroll, oyna o'lchami va sahifa balandligi o'zgarganda (scroll'siz siljish — rasm yuklanishi, o'yin bosqichi).
    let checkQueued = 0;
    const safety = () => {
      if (checkQueued) return;
      checkQueued = window.setTimeout(() => {
        checkQueued = 0;
        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>('[data-cine="pending"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) reveal(el);
        });
      }, 250);
    };
    window.addEventListener('scroll', safety, { passive: true });
    window.addEventListener('resize', safety);
    const ro = new ResizeObserver(safety);

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
    // Debounce: animatsiyalar DOM'ni tez-tez o'zgartiradi — har kadrda butun sahifani qayta o'lchash qotirardi
    let debounce = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = window.setTimeout(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(scan); }, 500);
    });
    const main = document.querySelector('main');
    if (main) { mo.observe(main, { childList: true, subtree: true }); ro.observe(main); }

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(pending);
      clearTimeout(debounce);
      mo.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', safety);
      window.removeEventListener('resize', safety);
      ro.disconnect();
      clearTimeout(checkQueued);
      // Kuzatuvchi o'chdi — yashirin qolganlarni ko'rsatib qo'yamiz
      document.querySelectorAll<HTMLElement>('[data-cine="pending"]').forEach((el) => { el.dataset.cine = 'done'; });
    };
  }, [pathname]);

  return null;
}
