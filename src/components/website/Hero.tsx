 
 
 
 
 
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/dictionaries';
import VohaLogo from '@/components/common/VohaLogo';

export default function Hero({ lang, companyName = 'QURILISH KOMPANIYA', heroTitle, heroDesc, images = [], settings = {} }: { lang: Locale, companyName?: string, heroTitle?: string, heroDesc?: string, images?: string[], settings?: Record<string, string> }) {
  const dict = getDictionary(lang);

  // Bosh sahifa slider — loyiha rasmlari avtomatik almashib turadi (5 soniyada bir)
  const slides = images.length > 0 ? images : ['/voha-actual-bg.png'];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const heroText: Record<Locale, { tag: string; titleHuge: string; title2: string; desc: string; btn2: string }> = {
    uz: {
      tag: 'Premium Toifadagi Turar-Joy Majmuasi',
      titleHuge: companyName.toUpperCase(),
      title2: 'Kelajagingiz uchun betakror maskan',
      desc: 'Mukammal arxitektura va zamonaviy yechimlar uyg\'unligi. O\'zingiz va oilangiz uchun Xorazmning eng prestijli nuqtasida chinakam qulaylikni kashf eting.',
      btn2: 'Loyiha bilan tanishish',
    },
    ru: {
      tag: 'Жилой Комплекс Премиум Класса',
      titleHuge: companyName.toUpperCase(),
      title2: 'Неповторимое пространство для вашего будущего',
      desc: 'Гармония совершенной архитектуры и современных решений. Откройте для себя истинный комфорт в самой престижной точке Хорезма.',
      btn2: 'Ознакомиться с проектом',
    },
    en: {
      tag: 'Premium Class Residential Complex',
      titleHuge: companyName.toUpperCase(),
      title2: 'A unique space for your future',
      desc: 'The harmony of perfect architecture and modern solutions. Discover true comfort in the most prestigious location of Khorezm.',
      btn2: 'Explore Projects',
    },
  };
  const t = heroText[lang] || heroText.uz;

  // Kirish ekrani (~2.2s) yopilgandan keyin hero elementlari ketma-ket chiqadi
  const REVEAL = 2.2;
  const titleText = (lang === 'uz' && heroTitle) ? heroTitle : t.title2;

  const stats: Record<Locale, Array<{label: string; value: string}>> = {
    uz: [
      { label: 'Tajriba', value: '15 Yil' },
      { label: 'Loyiha', value: '15+' },
      { label: 'Mijoz', value: '5000+' },
      { label: 'Sifat', value: 'A\'lo' },
    ],
    ru: [
      { label: 'Опыт', value: '15 лет' },
      { label: 'Проектов', value: '15+' },
      { label: 'Клиентов', value: '5000+' },
      { label: 'Качество', value: 'Отличное' },
    ],
    en: [
      { label: 'Experience', value: '15 Years' },
      { label: 'Projects', value: '15+' },
      { label: 'Clients', value: '5000+' },
      { label: 'Quality', value: 'Excellent' },
    ],
  };
  const baseStats = stats[lang] || stats.uz;
  // Admin sozlagan statistika (bo'sh bo'lsa — standart qiymat)
  const currentStats = baseStats.map((s, i) => ({
    value: settings[`hero_stat${i + 1}_value`] || s.value,
    label: settings[`hero_stat${i + 1}_label`] || s.label,
  }));

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-6 md:pb-10">
      {/* Background slider — loyiha rasmlari sekin almashib turadi (fade + zoom) */}
      <div className="absolute inset-0 bg-primary/20 z-0">
        {slides.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url("${src}")`,
              opacity: i === current ? 1 : 0,
              animation: i === current ? 'subtle-zoom 8s ease-out forwards' : 'none',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* General dark overlay for overall text readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Gradient at the top for Navbar readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" style={{ height: '30%' }} />
        
        {/* Gradient at the bottom to blend with the rest of the page */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent opacity-100" style={{ height: '60%', top: '40%' }} />
      </div>

      <div className="max-container relative z-10 px-4 sm:px-6 w-full text-center flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center w-full my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: REVEAL, duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-4 md:mb-5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-accent font-bold uppercase text-[9px] md:text-xs tracking-[0.28em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {t.tag}
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: REVEAL + 0.3, duration: 1, ease: "easeOut" }}
            className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[480px] mb-4 md:mb-6 opacity-90 mix-blend-plus-lighter"
          >
             <VohaLogo isScrolled={false} className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }} />
          </motion.div>
          
          <motion.h2
            aria-label={titleText}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.03, delayChildren: REVEAL + 0.6 } } }}
            className="text-2xl md:text-4xl lg:text-[3.25rem] text-white font-bold mb-3 md:mb-5 max-w-3xl tracking-tight leading-[1.08]"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45), 0 3px 14px rgba(0,0,0,0.35)' }}
          >
            {titleText.split(' ').map((word, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
                {Array.from(word).map((ch, ci) => (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }}
                  >
                    {ch}
                  </motion.span>
                ))}
                <span className="inline-block">&nbsp;</span>
              </span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: REVEAL + 1.7, duration: 0.9, ease: 'easeOut' }}
            className="text-sm md:text-base lg:text-lg text-white/90 mb-5 md:mb-7 max-w-2xl leading-relaxed md:leading-loose font-normal px-4"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.3)' }}>
            {lang === 'uz' && heroDesc ? heroDesc : t.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: REVEAL + 2.0, duration: 0.8, ease: 'easeOut' }}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2">
             <a href={`/${lang}#about`} className="group px-6 md:px-10 py-3 md:py-4 bg-accent text-primary font-bold rounded-full hover:bg-white transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(250,218,165,0.4)] tracking-wide inline-flex items-center gap-2 text-sm md:text-base">
                {dict.hero.details}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
             </a>
             <a href={`/${lang}#projects`} className="group px-6 md:px-10 py-3 md:py-4 bg-transparent backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white hover:text-primary transition-all transform hover:-translate-y-1 inline-flex items-center gap-2 text-sm md:text-base">
                {t.btn2}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
             </a>
          </motion.div>
        </div>
      </div>

      {/* Slider indikatorlari (nuqtalar) */}
      {slides.length > 1 && (
        <div className="relative z-20 flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slayd ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {/* Stats at bottom */}
      <div className="w-full relative z-20 mt-4 md:mt-8">
        <div className="max-container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {currentStats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: REVEAL + 2.3 + i * 0.1, duration: 0.8 }}
                className="group bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-3xl text-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 cursor-default"
              >
                <div className="w-8 h-1 mx-auto mb-3 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 group-hover:opacity-100 group-hover:w-12 transition-all duration-500" />
                <div className="text-accent font-black text-2xl md:text-3xl lg:text-4xl mb-1 drop-shadow-md group-hover:scale-105 transition-transform duration-500">{stat.value}</div>
                <div className="text-white/80 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors duration-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add subtle-zoom keyframes to global CSS or handle it inline */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.1); }
        }
      `}} />
    </section>
  );
}
