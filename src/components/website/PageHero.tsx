'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { responsive } from '@/lib/responsiveImg';

/*
  Ichki sahifalar uchun kino-sarlavha: to'liq kenglikdagi rasm (bir nechta bo'lsa sekin
  almashadi, Ken Burns), sarlavha so'zma-so'z maska ostidan ko'tariladi, scroll'da
  rasm sekinroq siljiydi (parallaks), matn xiralashib ketadi.
*/

const EASE = [0.22, 1, 0.36, 1] as const;
const HOME: Record<string, string> = { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' };

type Props = {
  lang: string;
  kicker: string;
  title: string;
  subtitle?: string;
  images?: string[];
  size?: 'full' | 'tall';
  children?: React.ReactNode;
  /** Section ustida mutlaq joylashadigan elementlar (holat belgisi, 360° tur tugmasi) — transform'siz qatlamda */
  overlay?: React.ReactNode;
};

export default function PageHero({ lang, kicker, title, subtitle, images = [], size = 'tall', children, overlay }: Props) {
  const ref = useRef<HTMLElement>(null);
  const list = images.filter(Boolean).length ? images.filter(Boolean) : ['/cinema/poster.webp'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [list.length]);

  // Sahifa scrollY (px) — SSR va klientda bir xil boshlang'ich qiymat
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 900], [0, 260]);
  const textY = useTransform(scrollY, [0, 700], [0, -120]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden bg-[#011f1f] flex items-end ${size === 'full' ? 'h-[100dvh]' : 'h-[78dvh] md:h-[86dvh]'} min-h-[520px]`}
    >
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        >
          {list.map((src, i) => {
            // Faqat joriy va keyingi slayd yuklanadi; srcSet — brauzer ekranga mos bitta o'lchamni
            // birinchi marta tanlaydi (telefon 640/1280, katta ekran asl) — ikki marta yuklanmaydi
            const load = i === current || i === (current + 1) % list.length;
            return load ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src + i}
                {...responsive(src, '100vw')}
                alt=""
                aria-hidden="true"
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out"
                style={{
                  opacity: i === current ? 1 : 0,
                  animation: i === current ? 'ph-kb 12s ease-out forwards' : 'none',
                }}
              />
            ) : null;
          })}
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#011f1f] via-[#011f1f]/50 to-transparent pointer-events-none" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 w-full max-container px-6 pb-14 md:pb-20">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
          className="flex items-center gap-1.5 text-white/55 text-xs mb-6"
          aria-label="breadcrumb"
        >
          <Link href={`/${lang}`} className="hover:text-white transition-colors">{HOME[lang] || HOME.uz}</Link>
          <ChevronRight size={12} />
          <span className="text-white/85 truncate max-w-[60vw]">{title}</span>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.7em' }}
          animate={{ opacity: 1, letterSpacing: '0.32em' }}
          transition={{ delay: 0.35, duration: 1.4, ease: EASE }}
          className="flex items-center gap-3 text-accent text-[10px] md:text-xs uppercase font-bold mb-4"
        >
          <span className="h-px w-10 bg-accent/70" />
          {kicker}
        </motion.div>

        <motion.h1
          aria-label={title}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } } }}
          className="font-montserrat font-extrabold text-white text-[clamp(2.4rem,7vw,6.5rem)] leading-[0.98] tracking-[-0.03em] max-w-5xl"
        >
          {title.split(' ').map((w, i) => (
            <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.22em]">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: '115%', rotate: 5 }, show: { y: '0%', rotate: 0, transition: { duration: 1.1, ease: EASE } } }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, ease: EASE }}
            className="mt-5 md:mt-7 text-white/75 text-base md:text-lg max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.9, ease: EASE }}
            className="mt-6 md:mt-8"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {overlay}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ph-kb { from { transform: scale(1.06); } to { transform: scale(1); } }
      ` }} />
    </section>
  );
}
