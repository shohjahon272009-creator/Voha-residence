/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { CATEGORIES } from '@/lib/categories';
import ProjectCard from './ProjectCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryShowcase({ projects, lang }: { projects: Project[]; lang: Locale }) {
  const count = (key: string) => projects.filter((p) => p.categories?.includes(key)).length;
  // Loyihasi bor kategoriya bo'lsa — o'shани, bo'lmasa birinchisini tanlaymiz
  const firstWith = CATEGORIES.find((c) => count(c.key) > 0)?.key ?? CATEGORIES[0].key;
  const [active, setActive] = useState<string>(firstWith);

  const filtered = projects.filter((p) => p.categories?.includes(active));

  const t = ({
    uz: { tag: 'JOYLASHUV BO‘YICHA', title: 'Sizga qulay joyni tanlang', sub: 'Maktab, bog‘cha, park yoki suv bo‘yi — o‘zingizga mos joylashuvni tanlang.', soon: 'Bu yo‘nalishda loyihalar tez orada qo‘shiladi.', pcs: 'loyiha' },
    ru: { tag: 'ПО РАСПОЛОЖЕНИЮ', title: 'Выберите удобное место', sub: 'Школа, детсад, парк или у воды — выберите подходящее расположение.', soon: 'Проекты по этому направлению скоро появятся.', pcs: 'проектов' },
    en: { tag: 'BY LOCATION', title: 'Choose a convenient location', sub: 'School, kindergarten, park or waterside — pick the right location.', soon: 'Projects for this option are coming soon.', pcs: 'projects' },
  } as const)[lang] || { tag: 'JOYLASHUV BO‘YICHA', title: 'Sizga qulay joyni tanlang', sub: '', soon: '', pcs: '' };

  return (
    <section className="py-24 px-6 bg-brand-mesh">
      <div className="max-container">
        <div className="text-center mb-12">
          <span className="eyebrow eyebrow--center mb-4">{t.tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">{t.title}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{t.sub}</p>
        </div>

        {/* Rasmli kategoriya kartalari */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-14">
          {CATEGORIES.map((c) => {
            const isActive = active === c.key;
            const n = count(c.key);
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`group relative h-40 md:h-48 rounded-3xl overflow-hidden text-left transition-all duration-300 ${
                  isActive ? 'ring-4 ring-accent shadow-2xl -translate-y-1' : 'ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {/* Zaxira gradient (rasm yuklanmasa) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
                {/* Rasm */}
                <img
                  src={c.image}
                  alt={c.label[lang]}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Qoraytiruvchi qatlam */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                {/* Matn */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-3xl mb-1 drop-shadow-lg">{c.emoji}</div>
                  <div className="font-bold text-base leading-tight drop-shadow">{c.label[lang]}</div>
                  {n > 0 && <div className="text-[11px] text-white/80 font-semibold mt-0.5">{n} {t.pcs}</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tanlangan kategoriya loyihalari */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 text-gray-400 font-medium">{t.soon}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
