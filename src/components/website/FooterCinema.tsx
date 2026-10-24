'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { VOHA_PATH, RESIDENCE_PATH } from '@/components/common/VohaLogo';

/*
  Footer ustidagi kino-yakun: katta chaqiruv (CTA) va pastda ekran kengligidagi
  logotip (aynan brendbukdagi VOHA RESIDENCE vektori) — pastdan ko'tariladi.
*/

const EASE = [0.22, 1, 0.36, 1] as const;

const T: Record<string, { kicker: string; title: string; cta: string; call: string }> = {
  uz: { kicker: 'Keyingi qadam', title: "Orzuingizdagi uy shu yerda", cta: "Xonadon tanlash", call: "Qo'ng'iroq qilish" },
  ru: { kicker: 'Следующий шаг', title: 'Дом вашей мечты — здесь', cta: 'Выбрать квартиру', call: 'Позвонить' },
  en: { kicker: 'Next step', title: 'Your dream home is here', cta: 'Choose an apartment', call: 'Call us' },
};

export function FooterCTA({ lang, phone = '+998 91 011 66 66' }: { lang: string; phone?: string }) {
  const t = T[lang] || T.uz;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#011f1f] py-28 md:py-40 px-6">
      <motion.div
        className="absolute inset-[-15%_0] bg-cover bg-center opacity-35"
        style={{ backgroundImage: 'url("/cinema/poster.webp")', y: bgY }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#011f1f] via-transparent to-primary pointer-events-none" />
      <div className="relative max-container text-center">
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.7em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.32em' }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: EASE }}
          className="text-accent text-xs uppercase font-bold mb-6"
        >
          {t.kicker}
        </motion.div>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="font-montserrat font-extrabold text-white text-[clamp(2.3rem,7vw,6rem)] leading-[1] tracking-[-0.03em] max-w-5xl mx-auto"
          aria-label={t.title}
          data-cine-skip
        >
          {t.title.split(' ').map((w, i) => (
            <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.22em]">
              <motion.span className="inline-block" variants={{ hidden: { y: '115%' }, show: { y: '0%', transition: { duration: 1.1, ease: EASE } } }}>
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="mt-10 md:mt-12 flex flex-wrap justify-center gap-4"
        >
          <Link href={`/${lang}/apartments`} className="group relative overflow-hidden inline-flex items-center gap-3 px-9 py-4 md:py-5 rounded-full bg-accent text-primary font-bold text-base md:text-lg shadow-[0_15px_50px_rgba(209,142,91,0.45)]">
            <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative">{t.cta}</span>
            <ArrowUpRight size={20} className="relative transition-transform duration-500 group-hover:rotate-45" />
          </Link>
          <a href={'tel:' + phone.replace(/[^\d+]/g, '')} className="inline-flex items-center gap-3 px-9 py-4 md:py-5 rounded-full border border-white/25 text-white font-bold text-base md:text-lg hover:bg-white hover:text-primary transition-colors duration-500">
            {t.call}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function FooterBigType() {
  // Logodagidek: aynan brendbukdagi "VOHA" harflari (kontur) va ostida "RESIDENCE" (bronza)
  return (
    <div aria-hidden="true" className="relative overflow-hidden select-none pointer-events-none mt-16 pb-6">
      <motion.svg
        viewBox="355 275 135 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block mx-auto w-[88%] max-w-[1500px] h-auto"
        initial={{ y: '35%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <path transform="matrix(1,0,0,-1,0,595.2756)" d={VOHA_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(209,142,91,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path transform="matrix(1,0,0,-1,0,595.2756)" d={RESIDENCE_PATH} fill="rgba(209,142,91,0.55)" />
      </motion.svg>
    </div>
  );
}
