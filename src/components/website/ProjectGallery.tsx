'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';

const L: Record<Locale, { eyebrow: string; title: string; view: string }> = {
  uz: { eyebrow: 'GALEREYA', title: 'Loyiha galereyasi', view: "Rasmni kattalashtirish" },
  ru: { eyebrow: 'ГАЛЕРЕЯ', title: 'Галерея проекта', view: 'Увеличить фото' },
  en: { eyebrow: 'GALLERY', title: 'Project gallery', view: 'View larger' },
};

export default function ProjectGallery({
  images,
  projectName,
  lang,
}: {
  images: string[];
  projectName: string;
  lang: Locale;
}) {
  const t = L[lang] || L.uz;
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <div>
      <span className="eyebrow mb-5">{t.eyebrow}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">{t.title}</h2>

      <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={t.view}
            className="group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100 focus:outline-none shadow-[0_8px_30px_rgba(20,20,40,0.06)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${projectName} ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur text-primary text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
              <Expand size={14} /> {t.view}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && index !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 text-white shrink-0">
            <div className="font-bold truncate">{projectName}</div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">{index + 1} / {images.length}</span>
              <button onClick={close} aria-label="Close" className="w-11 h-11 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center px-2 pb-6 md:px-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[index]} alt={projectName} className="max-w-full max-h-full object-contain rounded-xl" />

            {images.length > 1 && (
              <>
                <button onClick={prev} aria-label="Prev" className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button onClick={next} aria-label="Next" className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="shrink-0 flex items-center justify-center gap-2 pb-6 px-4 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === index ? 'border-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-90'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
