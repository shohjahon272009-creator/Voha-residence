'use client';

import React, { useState, useEffect } from 'react';

type Props = {
  images: string[];
  title?: string;
  subtitle?: string;
  /** Balandlik klassi (Tailwind), masalan "h-[55vh]" */
  heightClass?: string;
};

export default function SliderBanner({ images, title, subtitle, heightClass = 'h-[55vh]' }: Props) {
  const slides = images.length > 0 ? images : ['/voha-actual-bg.png'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className={`relative w-full ${heightClass} min-h-[360px] overflow-hidden`}>
      {/* Rasmlar — yumshoq fade + sekin zoom */}
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

      {/* Qoraytiruvchi gradient — matn o'qilishi uchun */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-black/40" />

      {/* Sarlavha */}
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          {subtitle && <span className="eyebrow eyebrow--center mb-4 !text-accent">{subtitle}</span>}
          {title && <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{title}</h1>}
        </div>
      )}

      {/* Nuqtalar */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slayd ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}

      {/* subtle-zoom keyframe (agar global bo'lmasa) */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes subtle-zoom { 0% { transform: scale(1.02); } 100% { transform: scale(1.1); } }` }} />
    </section>
  );
}
