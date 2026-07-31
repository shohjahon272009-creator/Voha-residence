'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Apartment, Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { Search, Home, Layers, Maximize2, Building2, SlidersHorizontal } from 'lucide-react';

type Props = {
  apartments: Apartment[];
  projects: Project[];
  lang: Locale;
  /** Bosh sahifada faqat shuncha karta ko'rsatiladi + "Hammasini ko'rish" tugmasi */
  limit?: number;
};

const L: Record<Locale, Record<string, string>> = {
  uz: {
    title: 'Xonadon tanlash', tag: 'XONADONLAR QIDIRUVI',
    rooms: 'Xonalar', floor: 'Qavat', project: 'Loyiha', area: 'Maydon, m²',
    status: 'Holati', all: 'Barchasi', reset: 'Tozalash', found: 'Topildi',
    variants: 'ta variant', from: 'dan', to: 'gacha', apt: 'Xonadon', floorS: 'Qavat',
    roomS: 'xona', areaS: 'm²', empty: 'Xonadonlar tez orada qo‘shiladi',
    emptyF: 'Bu filtrga mos xonadon topilmadi', available: 'Bo‘sh', booked: 'Band', reserved: 'Bronlangan',
    plan: 'chizma', view: 'Batafsil', priceLabel: 'Narx', onRequest: 'Shartnomaviy', details: 'Batafsil ko‘rish',
  },
  ru: {
    title: 'Подбор квартиры', tag: 'ПОИСК КВАРТИР',
    rooms: 'Комнат', floor: 'Этаж', project: 'Проект', area: 'Площадь, м²',
    status: 'Статус', all: 'Все', reset: 'Очистить', found: 'Найдено',
    variants: 'вариантов', from: 'от', to: 'до', apt: 'Квартира', floorS: 'Этаж',
    roomS: 'комн.', areaS: 'м²', empty: 'Квартиры скоро появятся',
    emptyF: 'По этому фильтру ничего не найдено', available: 'Свободно', booked: 'Продано', reserved: 'Забронировано',
    plan: 'план', view: 'Подробнее', priceLabel: 'Стоимость', onRequest: 'По запросу', details: 'Узнать подробнее',
  },
  en: {
    title: 'Find an Apartment', tag: 'APARTMENT SEARCH',
    rooms: 'Rooms', floor: 'Floor', project: 'Project', area: 'Area, m²',
    status: 'Status', all: 'All', reset: 'Reset', found: 'Found',
    variants: 'options', from: 'from', to: 'to', apt: 'Apartment', floorS: 'Floor',
    roomS: 'rooms', areaS: 'm²', empty: 'Apartments coming soon',
    emptyF: 'No apartments match this filter', available: 'Available', booked: 'Sold', reserved: 'Booked',
    plan: 'plan', view: 'Details', priceLabel: 'Price', onRequest: 'On request', details: 'View details',
  },
};

export default function ApartmentSearch({ apartments, projects, lang, limit }: Props) {
  const t = L[lang] || L.uz;

  // Topshirilgan (allaqachon topshirilgan) loyihalarni qidiruvdan chiqaramiz —
  // ularda sotuvga xonadon bo'lmaydi. Faqat aktiv loyihalar ko'rinadi.
  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'Topshirilgan'), [projects]);
  const activeIds = useMemo(() => new Set(activeProjects.map((p) => p.id)), [activeProjects]);
  const activeApartments = useMemo(() => apartments.filter((a) => activeIds.has(a.project_id)), [apartments, activeIds]);

  const bounds = useMemo(() => {
    if (activeApartments.length === 0) return { minFloor: 1, maxFloor: 1, minArea: 0, maxArea: 0 };
    const floors = activeApartments.map((a) => a.floor);
    const areas = activeApartments.map((a) => a.area);
    return {
      minFloor: Math.min(...floors), maxFloor: Math.max(...floors),
      minArea: Math.floor(Math.min(...areas)), maxArea: Math.ceil(Math.max(...areas)),
    };
  }, [activeApartments]);

  const [rooms, setRooms] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<'all' | "Bo'sh" | 'Band' | 'Bronlangan'>('all');
  const [floorMax, setFloorMax] = useState<number>(bounds.maxFloor);
  const [areaMin, setAreaMin] = useState<number>(bounds.minArea);
  const [areaMax, setAreaMax] = useState<number>(bounds.maxArea);

  const projName = (p: Project) => (p as unknown as Record<string, string>)[`name_${lang}`] || p.name_uz;

  const filtered = useMemo(() => {
    return activeApartments.filter((a) => {
      if (rooms !== null) {
        if (rooms === 4 ? a.rooms < 4 : a.rooms !== rooms) return false;
      }
      if (projectId !== 'all' && a.project_id !== projectId) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (a.floor > floorMax) return false;
      if (a.area < areaMin || a.area > areaMax) return false;
      return true;
    });
  }, [activeApartments, rooms, projectId, status, floorMax, areaMin, areaMax]);

  // Bosh sahifada faqat bir nechta karta; /apartments sahifasida hammasi
  const shown = limit ? filtered.slice(0, limit) : filtered;
  const hasMore = limit ? filtered.length > limit : false;

  const reset = () => {
    setRooms(null); setProjectId('all'); setStatus('all');
    setFloorMax(bounds.maxFloor); setAreaMin(bounds.minArea); setAreaMax(bounds.maxArea);
  };

  const statusLabel = (s: string) => s === "Bo'sh" ? t.available : s === 'Band' ? t.booked : t.reserved;
  const statusStyle = (s: string) =>
    s === "Bo'sh" ? 'bg-success/10 text-success border-success/30'
    : s === 'Band' ? 'bg-danger/10 text-danger border-danger/30'
    : 'bg-warning/10 text-warning border-warning/30';

  return (
    <section id="search" className="py-20 md:py-28 px-6 bg-brand-mesh">
      <div className="max-container">
        <div className="text-center mb-10">
          <span className="eyebrow eyebrow--center mb-4">{t.tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">{t.title}</h2>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-5 md:p-7 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            {/* Rooms */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Home size={14} /> {t.rooms}</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRooms(rooms === r ? null : r)}
                    className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${rooms === r ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {r === 4 ? '4+' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Building2 size={14} /> {t.project}</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/30 text-sm font-medium text-gray-700"
              >
                <option value="all">{t.all}</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>{projName(p)}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><SlidersHorizontal size={14} /> {t.status}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/30 text-sm font-medium text-gray-700"
              >
                <option value="all">{t.all}</option>
                <option value="Bo'sh">{t.available}</option>
                <option value="Band">{t.booked}</option>
                <option value="Bronlangan">{t.reserved}</option>
              </select>
            </div>

            {/* Area range */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Maximize2 size={14} /> {t.area}</label>
              <div className="flex items-center gap-2">
                <input type="number" value={areaMin} min={bounds.minArea} max={bounds.maxArea}
                  onChange={(e) => setAreaMin(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm text-center" />
                <span className="text-gray-300">—</span>
                <input type="number" value={areaMax} min={bounds.minArea} max={bounds.maxArea}
                  onChange={(e) => setAreaMax(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm text-center" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <div className="text-sm">
              <span className="text-gray-400">{t.found}: </span>
              <span className="font-black text-primary text-lg">{filtered.length}</span>
              <span className="text-gray-400"> {t.variants}</span>
            </div>
            <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:border-primary hover:text-primary transition-all">
              <Search size={15} /> {t.reset}
            </button>
          </div>
        </div>

        {/* Results */}
        {activeApartments.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">{t.empty}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">{t.emptyF}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shown.map((a) => {
              const proj = activeProjects.find((p) => p.id === a.project_id);
              return (
                <Link
                  key={a.id}
                  href={`/${lang}/projects/${a.project_id}`}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Floor plan */}
                  <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100 overflow-hidden">
                    {a.plan_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.plan_image} alt={`${a.number}-${t.plan}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-300">
                        <Layers size={44} strokeWidth={1.2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest mt-2">{a.number}-{t.plan}</span>
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyle(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-2xl font-black text-primary tracking-tight">№{a.number}</span>
                      <span className="text-sm font-bold text-accent">{a.area} {t.areaS}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500"><Home size={13} /> {a.rooms} {t.roomS}</div>
                      <div className="flex items-center gap-1.5 text-gray-500"><Layers size={13} /> {a.floor}-{t.floorS}</div>
                    </div>
                    {proj && (
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium truncate">
                        <Building2 size={12} className="shrink-0" /> {projName(proj)}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{t.priceLabel}</span>
                      <span className="font-bold text-primary">{t.onRequest}</span>
                    </div>
                    <div className="mt-4 w-full py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-bold text-center group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-1.5">
                      <Search size={13} /> {t.details}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-12">
            <Link
              href={`/${lang}/apartments`}
              className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-accent hover:text-primary transition-all"
            >
              {lang === 'ru' ? 'Смотреть все квартиры' : lang === 'en' ? 'View all apartments' : 'Hamma xonadonlarni ko‘rish'}
              <span className="opacity-80">({filtered.length})</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
