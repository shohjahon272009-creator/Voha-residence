'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Apartment, Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { Home, Layers, Maximize2, Building2, CalendarDays, Search, ArrowRight } from 'lucide-react';

type Props = { apartments: Apartment[]; projects: Project[]; lang: Locale };

const L: Record<Locale, Record<string, string>> = {
  uz: { tag: 'XONADON TANLASH', title: 'O‘zingizga mos xonadonni toping', rooms: 'Xonalar', project: 'Loyiha', area: 'Maydon, m²', year: 'Topshirish', all: 'Barchasi', found: 'Topildi', pcs: 'ta variant', reset: 'Tozalash', roomS: 'xona', floorS: '-qavat', priceLabel: 'Narx', onReq: 'So‘rov bo‘yicha', more: 'Ko‘proq', details: 'Batafsil', empty: 'Bu shartlarga mos xonadon topilmadi', plan: 'chizma' },
  ru: { tag: 'ПОДБОР КВАРТИРЫ', title: 'Найдите подходящую квартиру', rooms: 'Комнат', project: 'Проект', area: 'Площадь, м²', year: 'Сдача', all: 'Все', found: 'Найдено', pcs: 'вариантов', reset: 'Очистить', roomS: 'комн.', floorS: ' этаж', priceLabel: 'Цена', onReq: 'По запросу', more: 'Ещё', details: 'Подробнее', empty: 'По этим условиям ничего не найдено', plan: 'план' },
  en: { tag: 'FIND AN APARTMENT', title: 'Find the apartment that fits you', rooms: 'Rooms', project: 'Project', area: 'Area, m²', year: 'Handover', all: 'All', found: 'Found', pcs: 'options', reset: 'Reset', roomS: 'rooms', floorS: ' floor', priceLabel: 'Price', onReq: 'On request', more: 'More', details: 'Details', empty: 'No apartments match these filters', plan: 'plan' },
};

export default function ApartmentBrowser({ apartments, projects, lang }: Props) {
  const t = L[lang] || L.uz;
  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'Topshirilgan'), [projects]);
  const activeIds = useMemo(() => new Set(activeProjects.map((p) => p.id)), [activeProjects]);
  const apts = useMemo(() => apartments.filter((a) => activeIds.has(a.project_id)), [apartments, activeIds]);
  const projName = (p: Project) => (p as unknown as Record<string, string>)[`name_${lang}`] || p.name_uz;
  const years = useMemo(() => Array.from(new Set(activeProjects.map((p) => p.delivery_year).filter(Boolean))).sort() as number[], [activeProjects]);

  const bounds = useMemo(() => {
    if (apts.length === 0) return { minA: 0, maxA: 200 };
    const a = apts.map((x) => x.area);
    return { minA: Math.floor(Math.min(...a)), maxA: Math.ceil(Math.max(...a)) };
  }, [apts]);

  const [rooms, setRooms] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | 'all'>('all');
  const [year, setYear] = useState<number | 'all'>('all');
  const [areaMin, setAreaMin] = useState(bounds.minA);
  const [areaMax, setAreaMax] = useState(bounds.maxA);

  const filtered = useMemo(() => {
    return apts.filter((a) => {
      if (rooms !== null && (rooms === 4 ? a.rooms < 4 : a.rooms !== rooms)) return false;
      if (projectId !== 'all' && a.project_id !== projectId) return false;
      if (a.area < areaMin || a.area > areaMax) return false;
      if (year !== 'all') {
        const p = activeProjects.find((x) => x.id === a.project_id);
        if (p?.delivery_year !== year) return false;
      }
      return true;
    });
  }, [apts, rooms, projectId, year, areaMin, areaMax, activeProjects]);

  const [visible, setVisible] = useState(9);
  useEffect(() => { setVisible(9); }, [rooms, projectId, year, areaMin, areaMax]);
  const shown = filtered.slice(0, visible);

  const reset = () => { setRooms(null); setProjectId('all'); setYear('all'); setAreaMin(bounds.minA); setAreaMax(bounds.maxA); };

  if (apts.length === 0) return null;

  return (
    <section id="apartments" className="py-24 px-6 bg-brand-mesh">
      <div className="max-container">
        <div className="text-center mb-10">
          <span className="eyebrow eyebrow--center mb-4">{t.tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">{t.title}</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Chap: filtr */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-6 lg:sticky lg:top-24 space-y-6">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Home size={14} /> {t.rooms}</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((r) => (
                    <button key={r} onClick={() => setRooms(rooms === r ? null : r)}
                      className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${rooms === r ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {r === 4 ? '4+' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Building2 size={14} /> {t.project}</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm font-medium text-gray-700">
                  <option value="all">{t.all}</option>
                  {activeProjects.map((p) => <option key={p.id} value={p.id}>{projName(p)}</option>)}
                </select>
              </div>

              {years.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><CalendarDays size={14} /> {t.year}</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setYear('all')} className={`px-3 h-9 rounded-lg text-sm font-bold ${year === 'all' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{t.all}</button>
                    {years.map((y) => (
                      <button key={y} onClick={() => setYear(y)} className={`px-3 h-9 rounded-lg text-sm font-bold ${year === y ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{y}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Maximize2 size={14} /> {t.area}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={areaMin} onChange={(e) => setAreaMin(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm text-center" />
                  <span className="text-gray-300">—</span>
                  <input type="number" value={areaMax} onChange={(e) => setAreaMax(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm text-center" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm"><span className="text-gray-400">{t.found}: </span><span className="font-black text-primary">{filtered.length}</span></div>
                <button onClick={reset} className="text-sm font-bold text-gray-400 hover:text-primary">{t.reset}</button>
              </div>
            </div>
          </aside>

          {/* O'ng: xonadonlar */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium">{t.empty}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {shown.map((a) => {
                    const p = activeProjects.find((x) => x.id === a.project_id);
                    return (
                      <Link key={a.id} href={`/${lang}/projects/${a.project_id}`}
                        className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100 overflow-hidden">
                          {a.plan_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.plan_image} alt={`${a.number}-${t.plan}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-300"><Layers size={40} strokeWidth={1.2} /><span className="text-[11px] font-bold uppercase tracking-widest mt-2">№{a.number}</span></div>
                          )}
                          {p?.delivery_year && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-primary shadow">{p.delivery_year}</span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-2xl font-black text-primary">№{a.number}</span>
                            <span className="text-sm font-bold text-accent">{a.area} m²</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><Home size={13} /> {a.rooms} {t.roomS}</div>
                            <div className="flex items-center gap-1.5"><Layers size={13} /> {a.floor}{t.floorS}</div>
                          </div>
                          {p && <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium truncate"><Building2 size={12} className="shrink-0" /> {projName(p)}</div>}
                          <div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-gray-400">{t.priceLabel}</span><span className="font-bold text-primary">{t.onReq}</span></div>
                          <div className="mt-4 w-full py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-bold text-center group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-1.5">
                            {t.details} <ArrowRight size={13} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {filtered.length > visible && (
                  <div className="text-center mt-10">
                    <button onClick={() => setVisible((v) => v + 9)}
                      className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-accent hover:text-primary transition-all">
                      <Search size={16} /> {t.more} (+{Math.min(9, filtered.length - visible)})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
