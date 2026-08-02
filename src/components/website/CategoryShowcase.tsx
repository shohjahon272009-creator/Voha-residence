'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { CATEGORIES } from '@/lib/categories';
import ProjectCard from './ProjectCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryShowcase({ projects, lang }: { projects: Project[]; lang: Locale }) {
  // Faqat kamida bitta loyihasi bor kategoriyalar ko'rsatiladi (admin belgilaydi)
  const available = CATEGORIES.filter((c) => projects.some((p) => p.categories?.includes(c.key)));
  const [active, setActive] = useState<string | null>(available[0]?.key ?? null);

  // Admin hali hech bir loyihaga kategoriya bermagan bo'lsa — bo'lim ko'rinmaydi
  if (available.length === 0) return null;

  const filtered = active ? projects.filter((p) => p.categories?.includes(active)) : projects;

  const t = ({
    uz: { tag: 'JOYLASHUV BO‘YICHA', title: 'Sizga qulay joyni tanlang', sub: 'Maktab, bog‘cha, park yoki suv bo‘yi — o‘zingizga mos loyihani toping.' },
    ru: { tag: 'ПО РАСПОЛОЖЕНИЮ', title: 'Выберите удобное место', sub: 'Школа, детсад, парк или у воды — найдите подходящий проект.' },
    en: { tag: 'BY LOCATION', title: 'Choose a convenient location', sub: 'School, kindergarten, park or waterside — find the right project.' },
  } as const)[lang] || { tag: 'JOYLASHUV BO‘YICHA', title: 'Sizga qulay joyni tanlang', sub: '' };

  return (
    <section className="py-24 px-6 bg-brand-mesh">
      <div className="max-container">
        <div className="text-center mb-10">
          <span className="eyebrow eyebrow--center mb-4">{t.tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">{t.title}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{t.sub}</p>
        </div>

        {/* Kategoriya tugmalari */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {available.map((c) => {
            const isActive = active === c.key;
            const count = projects.filter((p) => p.categories?.includes(c.key)).length;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 -translate-y-0.5'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-primary/40 hover:-translate-y-0.5 shadow-sm'
                }`}
              >
                <span className="text-xl leading-none">{c.emoji}</span>
                {c.label[lang]}
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tanlangan kategoriya loyihalari */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active || 'all'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} lang={lang} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
