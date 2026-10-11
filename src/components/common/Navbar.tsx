 
 
 
 
 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X } from 'lucide-react';
import VohaLogo from '@/components/common/VohaLogo';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar({ lang }: { lang: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dict = getDictionary(lang);
  const pathname = usePathname();

  // Har sahifa endi qorong'i kino-sarlavha bilan boshlanadi — navbar tepada shaffof
  const isNavbarWhite = scrolled;

  // Sahifa bo'yicha scroll progress (navbar pastidagi bronza chiziq)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useEffect(() => {
    let last = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // Pastga scroll — yashirinadi, yuqoriga — qaytadi
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400);
        last = y;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLocalizedHref = (newLang: string) => {
    if (!pathname) return `/${newLang}`;
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/');
  };

  const navLinks = [
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/apartments`, label: dict.nav.apartments },
    { href: `/${lang}/news`, label: dict.nav.news },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
      // Ko'rinib turganda transform YO'Q — aks holda ichidagi fixed mobil menyu navbar ichida qolib ketadi
      hidden && !isOpen ? "-translate-y-full" : ""
    )}>
      
      {/* Main Navbar */}
      <div className={cn(
        "transition-all duration-300 px-6",
        isNavbarWhite ? "bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(1,66,66,0.08)] border-b border-white/60 py-3.5" : "bg-transparent py-6"
      )}>
      <div className="max-container flex items-center justify-between">
        <Link href={`/${lang}`} className="flex items-center transition-colors text-primary">
          <VohaLogo className="h-10 w-auto" isScrolled={isNavbarWhite} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-8">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative whitespace-nowrap text-[14px] xl:text-[15px] font-bold transition-colors hover:text-accent",
                  active ? "text-accent" : isNavbarWhite ? "text-[#014242]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-accent transition-all duration-300",
                  active ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <div className="hidden xl:flex items-center gap-2 text-accent whitespace-nowrap">
            <Phone size={18} />
            <a href="tel:+998910116666" className={cn(
              "font-bold hover:opacity-80 transition-opacity",
              isNavbarWhite ? "text-[#014242]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            )}>
              +998 91 011 66 66
            </a>
          </div>
          
          <div className="flex items-center gap-2">
             <a href="tel:+998910116666" className="whitespace-nowrap px-5 xl:px-6 py-2.5 bg-gradient-to-r from-accent to-[#c47e4d] text-white rounded-full text-sm font-bold shadow-lg shadow-accent/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 transition-all">
                {dict.nav.order_call}
             </a>
             <div className="flex gap-1 ml-2 xl:ml-4">
                {['uz', 'ru', 'en'].map((l) => (
                  <Link 
                    key={l}
                    href={getLocalizedHref(l)}
                    className={cn(
                      'text-[13px] uppercase font-bold px-2 py-1 rounded transition-colors',
                      lang === l ? 'bg-accent text-white shadow-sm' : (isNavbarWhite ? 'text-[#014242] hover:text-accent' : 'text-white hover:text-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]')
                    )}
                  >
                    {l}
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={cn("lg:hidden", isNavbarWhite ? "text-[#014242]" : "text-white")}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      </div>
      <motion.div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 h-[2px] bg-accent origin-left transition-opacity duration-500"
        style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
      />

      {/* Mobile Menu — kino parda */}
      <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-center px-8 overflow-y-auto"
          style={{ backgroundColor: '#012f2f' }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.77, 0, 0.18, 1] }}
        >
          <nav className="flex flex-col gap-3">
            {navLinks.map((link, i) => (
              <div key={link.href} className="overflow-hidden">
                <motion.div
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '110%' }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-baseline gap-4 text-4xl font-extrabold tracking-tight transition-colors",
                      pathname === link.href ? "text-accent" : "text-white hover:text-accent"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-bebas text-base text-accent/70 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                    {link.label}
                  </Link>
                </motion.div>
              </div>
            ))}
          </nav>
          <motion.div
            className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
             <a href="tel:+998910116666" className="text-2xl text-accent font-bold hover:opacity-80 transition-opacity">+998 91 011 66 66</a>
             <div className="flex gap-3">
                {['uz', 'ru', 'en'].map((l) => (
                  <Link
                    key={l}
                    href={getLocalizedHref(l)}
                    className={cn(
                      'text-sm uppercase font-bold px-4 py-2 rounded-full border',
                      lang === l ? 'bg-accent border-accent text-white' : 'border-white/20 text-white/60'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {l}
                  </Link>
                ))}
             </div>
          </motion.div>
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setIsOpen(false)}
            aria-label="Yopish"
          >
            <X size={32} />
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}
