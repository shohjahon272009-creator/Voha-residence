'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

/*
  Kichik video karta: hero videosi endi to'liq ekran emas, "loyihalarimizdan biri" sifatida.
  - Video faqat karta ekranga yaqinlashganda yuklanadi (preload="none" + src keyin qo'yiladi).
  - Faqat ko'rinib turganda o'ynaydi, ekrandan chiqsa pauza.
  - prefers-reduced-motion yoki Save-Data bo'lsa — faqat poster rasm (video umuman yuklanmaydi).
  - Telefon (<1024px): vertikal hero-mobile.mp4 (1.5 MB), katta ekran: hero.mp4 (4.4 MB).
*/

const MOBILE_MQ = '(max-width: 1023px)';

type Props = {
  lang: string;
  badge: string;
  name: string;
  city: string;
  cta: string;
  className?: string;
};

export default function ProjectVideoCard({ lang, badge, name, city, cta, className = '' }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  // 1) Yaqinlashganda manbani qo'yamiz (agar harakat/trafik cheklovi bo'lmasa)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduced || saveData) return; // faqat poster
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setSrc(window.matchMedia(MOBILE_MQ).matches ? '/cinema/hero-mobile.mp4' : '/cinema/hero.mp4');
    }, { rootMargin: '300px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Faqat ko'rinib turganda o'ynatamiz
  useEffect(() => {
    const el = boxRef.current;
    const v = videoRef.current;
    if (!el || !v || !src) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { io.disconnect(); v.pause(); };
  }, [src]);

  return (
    <div
      ref={boxRef}
      className={`group relative min-w-0 overflow-hidden rounded-3xl bg-[#011f1f] ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* Poster — video o'ynay boshlaguncha (yoki cheklovda doim) ko'rinadi */}
      <picture>
        <source media={MOBILE_MQ} srcSet="/cinema/poster-mobile.webp" />
        <img
          src="/cinema/poster.webp"
          alt={`${name} — ${city}`}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
      </picture>
      {src && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* O'qilishi uchun yengil gradientlar (blur yo'q) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      <div className="absolute left-4 top-4 md:left-5 md:top-5 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {badge}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <h3 className="font-montserrat text-xl md:text-2xl font-extrabold leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">
          {name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
            <MapPin size={14} className="text-accent" />
            {city}
          </span>
          <Link
            href={`/${lang}/projects`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs md:text-sm font-bold text-primary transition-colors duration-300 hover:bg-white"
          >
            {cta}
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
