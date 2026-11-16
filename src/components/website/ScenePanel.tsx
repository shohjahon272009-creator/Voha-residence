/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Layers, Home, ArrowRight, CalendarCheck, FileImage } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/dictionaries';
import type { SceneBuilding } from '@/lib/scene';
import ProjectStatusBadge from './ProjectStatusBadge';

/*
  3D turdagi bino kartasi: rasm, nom, holat, qavatlar, bo'sh/jami xonadon, xonadonlar ro'yxati,
  "Loyiha sahifasi" va "Ko'rishga yozilish". Kompyuterda o'ng yon panel, telefonda pastdan chiqadigan varaq.
  Narx ko'rsatilmaydi (rahbar qarori) — o'rniga "menejerdan so'rang".
*/
export default function ScenePanel({
  b, name, lang, modalOpen = false, onClose, onBook,
}: {
  b: SceneBuilding;
  name: string;
  lang: Locale;
  /** Ariza oynasi ochiq — Escape faqat uni yopsin, panel qolsin */
  modalOpen?: boolean;
  onClose: () => void;
  onBook: () => void;
}) {
  const dict = getDictionary(lang);
  const t = dict.tour3d;
  const aptStatus: Record<string, string> = {
    "Bo'sh": dict.apartments.status.available,
    Band: dict.apartments.status.sold,
    Bronlangan: dict.apartments.status.booked,
  };
  const hasFree = b.counts.available > 0;
  // Boshqa blok tanlanganda panel key={b.id} bilan qayta yaratiladi — filtr o'sha blokka mos boshlanadi
  const [onlyFree, setOnlyFree] = useState(hasFree);

  useEffect(() => {
    if (modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, modalOpen]);

  const list = onlyFree ? b.apartments.filter((a) => a.status === "Bo'sh") : b.apartments;
  const place = [b.project.district, b.project.city].filter(Boolean).join(', ');

  return (
    <aside
      aria-label={name}
      className="absolute z-30 inset-x-0 bottom-0 max-h-[58vh] md:inset-x-auto md:top-20 md:right-4 md:bottom-4 md:max-h-none md:w-[380px] flex flex-col bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_50px_rgba(1,66,66,0.25)] md:shadow-2xl overflow-hidden animate-fade-in"
    >
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="relative h-32 md:h-44 bg-primary shrink-0">
          <img
            src={b.project.main_image || '/cinema/poster.webp'}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute top-3 left-3">
            <ProjectStatusBadge status={b.project.status} daysLeft={b.project.days_left} soldOut={b.project.is_sold_out} lang={lang} />
          </div>
          <div className="absolute left-4 right-4 bottom-3">
            <h2 className="text-white text-xl md:text-2xl font-bold leading-tight drop-shadow">{name}</h2>
            {place && <p className="text-white/75 text-xs mt-0.5">{place}</p>}
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-primary/5 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-primary/50 uppercase tracking-wide"><Layers size={13} /> {t.floors}</p>
              <p className="text-primary text-lg font-bold mt-0.5">{b.project.total_floors ?? '—'}</p>
            </div>
            <div className="rounded-2xl bg-primary/5 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-primary/50 uppercase tracking-wide"><Home size={13} /> {t.apartments}</p>
              <p className="text-primary text-lg font-bold mt-0.5">
                {b.counts.available} <span className="text-xs font-medium text-primary/50">{t.available} / {b.counts.total} {t.total}</span>
              </p>
            </div>
          </div>
          <p className="text-[12px] text-accent font-bold mt-3">{t.priceOnRequest}</p>
        </div>

        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="font-bold text-primary text-sm">{t.apartments}</h3>
            {hasFree && (
              <div className="flex rounded-full bg-gray-100 p-0.5 text-[11px] font-bold">
                <button type="button" onClick={() => setOnlyFree(true)} className={`px-3 py-1 rounded-full transition-colors ${onlyFree ? 'bg-primary text-white' : 'text-gray-500'}`}>
                  {aptStatus["Bo'sh"]} · {b.counts.available}
                </button>
                <button type="button" onClick={() => setOnlyFree(false)} className={`px-3 py-1 rounded-full transition-colors ${!onlyFree ? 'bg-primary text-white' : 'text-gray-500'}`}>
                  {t.total} · {b.counts.total}
                </button>
              </div>
            )}
          </div>

          {b.apartments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">{t.noApartments}</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-2 pr-2 font-bold">{t.floor}</th>
                  <th className="py-2 pr-2 font-bold">{t.number}</th>
                  <th className="py-2 pr-2 font-bold">{t.rooms}</th>
                  <th className="py-2 pr-2 font-bold">{t.area}</th>
                  <th className="py-2 font-bold">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((a) => (
                  <tr key={a.id} className="text-primary">
                    <td className="py-2 pr-2 tabular-nums">{a.floor}</td>
                    <td className="py-2 pr-2 tabular-nums font-bold">
                      {a.plan_image ? (
                        <a href={a.plan_image} target="_blank" rel="noopener noreferrer" title={t.plan} className="inline-flex items-center gap-1 underline decoration-accent/50 underline-offset-2 hover:text-accent">
                          {a.number} <FileImage size={12} className="text-accent" />
                        </a>
                      ) : a.number}
                    </td>
                    <td className="py-2 pr-2 tabular-nums">{a.rooms}</td>
                    <td className="py-2 pr-2 tabular-nums">{a.area}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <span className={`w-2 h-2 rounded-full ${a.status === "Bo'sh" ? 'bg-success' : a.status === 'Bronlangan' ? 'bg-warning' : 'bg-gray-300'}`} />
                        {aptStatus[a.status] || a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-2.5 p-3 border-t border-gray-100 bg-white">
        <Link
          href={`/${lang}/projects/${b.project_id}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 text-primary text-sm font-bold py-3 hover:bg-primary/5 transition-colors"
        >
          {t.projectPage} <ArrowRight size={15} />
        </Link>
        <button
          type="button"
          onClick={onBook}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-accent text-primary text-sm font-bold py-3 shadow-lg shadow-accent/30 hover:bg-primary hover:text-white transition-colors"
        >
          <CalendarCheck size={15} /> {t.book}
        </button>
      </div>
    </aside>
  );
}
