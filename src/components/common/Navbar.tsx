 
 
 
 
 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X } from 'lucide-react';
import VohaLogo from '@/components/common/VohaLogo';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar({ lang }: { lang: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dict = getDictionary(lang);
  const pathname = usePathname();

  const isHomePage = pathname === '/' || pathname === '/uz' || pathname === '/ru' || pathname === '/en';
  const isNavbarWhite = !isHomePage || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
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
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* Main Navbar */}
      <div className={cn(
        "transition-all duration-300 px-6",
        isNavbarWhite ? "bg-white shadow-sm border-b border-gray-100 py-4" : "bg-transparent py-6"
      )}>
      <div className="max-container flex items-center justify-between">
        <Link href={`/${lang}`} className="flex items-center transition-colors text-primary">
          <VohaLogo className="h-10 w-auto" isScrolled={isNavbarWhite} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative text-[15px] font-bold transition-colors hover:text-accent",
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
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 text-accent">
            <Phone size={18} />
            <a href="tel:+998910116666" className={cn(
              "font-bold hover:opacity-80 transition-opacity",
              isNavbarWhite ? "text-[#014242]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            )}>
              +998 91 011 66 66
            </a>
          </div>
          
          <div className="flex items-center gap-2">
             <a href="tel:+998910116666" className="px-6 py-2.5 bg-gradient-to-r from-accent to-[#c47e4d] text-white rounded-full text-sm font-bold shadow-lg shadow-accent/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 transition-all">
                {dict.nav.order_call}
             </a>
             <div className="flex gap-2 ml-4">
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-primary/95 z-50 flex flex-col items-center justify-center gap-8 p-10 animate-fade-in">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-2xl font-bold text-white hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col items-center gap-6">
             <a href="tel:+998910116666" className="text-xl text-accent font-bold hover:opacity-80 transition-opacity">+998 91 011 66 66</a>
             <div className="flex gap-4">
                {['uz', 'ru', 'en'].map((l) => (
                  <Link 
                    key={l}
                    href={`/${l}`}
                    className={cn(
                      'text-lg uppercase font-bold px-3 py-1 rounded',
                      lang === l ? 'bg-accent text-white' : 'text-white/60'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {l}
                  </Link>
                ))}
             </div>
          </div>
          <button 
            className="absolute top-6 right-6 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={32} />
          </button>
        </div>
      )}
    </nav>
  );
}
