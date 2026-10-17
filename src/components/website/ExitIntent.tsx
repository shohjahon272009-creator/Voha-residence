'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Zap, Home } from 'lucide-react';

/*
  Chiqib ketishdan oldin — "30 soniyada uyingizni toping" taklifi (sessiyada 1 marta).
  Kompyuter: sichqoncha oynaning yuqori chetidan chiqqanda. Telefon: 45 soniyadan keyin,
  sahifaning 40% dan ko'prog'i ko'rilgan bo'lsa. O'yin bo'limida bo'lsa yoki uni o'ynagan bo'lsa — chiqmaydi.
*/

const KEY = 'voha_exit_shown';
const T: Record<string, { title: string; sub: string; cta: string; later: string }> = {
  uz: { title: 'Ketishdan oldin…', sub: "5 ta savol — va 30 soniyada sizga aynan mos uyni topamiz. Bepul va majburiyatsiz.", cta: "Uyimni topish", later: 'Keyinroq' },
  ru: { title: 'Прежде чем уйти…', sub: '5 вопросов — и за 30 секунд подберём именно вашу квартиру. Бесплатно и без обязательств.', cta: 'Найти мою квартиру', later: 'Позже' },
  en: { title: 'Before you go…', sub: '5 questions — and in 30 seconds we find the home that fits you. Free, no obligation.', cta: 'Find my home', later: 'Later' },
};

export default function ExitIntent({ lang }: { lang: string }) {
  const t = T[lang] || T.uz;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let shown = false;
    try { shown = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
    if (shown) return;
    const startedAt = Date.now();
    const questVisible = () => {
      const q = document.getElementById('uy-tanlash');
      if (!q) return false;
      const r = q.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    const trigger = () => {
      if (Date.now() - startedAt < 8000 || questVisible()) return;
      try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
      setOpen(true);
      cleanup();
    };
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 0) trigger(); };
    const touch = window.matchMedia('(hover: none)').matches;
    const timer = touch ? window.setTimeout(() => {
      const seen = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (seen > 0.4) trigger();
    }, 45000) : 0;
    if (!touch) document.addEventListener('mouseout', onOut);
    function cleanup() { document.removeEventListener('mouseout', onOut); clearTimeout(timer); }
    return cleanup;
  }, [pathname]);

  const go = () => {
    setOpen(false);
    const home = pathname === `/${lang}` || pathname === '/';
    if (home) document.getElementById('uy-tanlash')?.scrollIntoView({ behavior: 'smooth' });
    else router.push(`/${lang}#uy-tanlash`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[28px] bg-primary text-white p-8 text-center shadow-2xl border border-white/10"
          >
            <button onClick={() => setOpen(false)} aria-label="Yopish" className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={22} /></button>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-accent text-primary flex items-center justify-center"><Home size={30} /></div>
            <h3 className="mt-5 text-3xl font-extrabold tracking-tight">{t.title}</h3>
            <p className="mt-3 text-white/75 leading-relaxed">{t.sub}</p>
            <button onClick={go} className="mt-7 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent text-primary font-extrabold hover:bg-white transition-colors">
              <Zap size={18} />{t.cta}
            </button>
            <button onClick={() => setOpen(false)} className="mt-3 text-white/50 text-sm hover:text-white">{t.later}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
