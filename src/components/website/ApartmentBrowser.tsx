/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Apartment, Project, SelectedApartment } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { CATEGORIES } from '@/lib/categories';
import ProjectCard from './ProjectCard';
import { Home, Layers, Maximize2, Building2, CalendarDays, Search, ArrowRight, Calculator } from 'lucide-react';

type Props = { apartments: Apartment[]; projects: Project[]; lang: Locale; onSelect?: (apt: SelectedApartment) => void };

const L: Record<Locale, Record<string, string>> = {
  uz: { tag: 'XONADON TANLASH', title: 'O‘zingizga mos xonadonni toping', byLoc: 'Joylashuv bo‘yicha', rooms: 'Xonalar', project: 'Loyiha', area: 'Maydon, m²', year: 'Topshirish', all: 'Barchasi', found: 'Topildi', pcs: 'ta variant', reset: 'Tozalash', roomS: 'xona', floorS: '-qavat', priceLabel: 'Narx', onReq: 'So‘rov bo‘yicha', more: 'Ko‘proq', details: 'Batafsil', empty: 'Bu shartlarga mos xonadon topilmadi', plan: 'chizma', calc: 'To‘lovni hisoblash', matchProj: 'Mos loyihalar' },
  ru: { tag: 'ПОДБОР КВАРТИРЫ', title: 'Найдите подходящую квартиру', byLoc: 'По расположению', rooms: 'Комнат', project: 'Проект', area: 'Площадь, м²', year: 'Сдача', all: 'Все', found: 'Найдено', pcs: 'вариантов', reset: 'Очистить', roomS: 'комн.', floorS: ' этаж', priceLabel: 'Цена', onReq: 'По запросу', more: 'Ещё', details: 'Подробнее', empty: 'По этим условиям ничего не найдено', plan: 'план', calc: 'Рассчитать платёж', matchProj: 'Подходящие проекты' },
  en: { tag: 'FIND AN APARTMENT', title: 'Find the apartment that fits you', byLoc: 'By location', rooms: 'Rooms', project: 'Project', area: 'Area, m²', year: 'Handover', all: 'All', found: 'Found', pcs: 'options', reset: 'Reset', roomS: 'rooms', floorS: ' floor', priceLabel: 'Price', onReq: 'On request', more: 'More', details: 'Details', empty: 'No apartments match these filters', plan: 'plan', calc: 'Calculate payment', matchProj: 'Matching projects' },
};

export default function ApartmentBrowser({ apartments, projects, lang, onSelect }: Props) {
  const t = L[lang] || L.uz;
  const scrollToCalc = () => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Sotib tugatilgan va topshirilgan loyihalar xonadon tanlash bo'limida ko'rinmaydi
  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'Topshirilgan' && !p.is_sold_out), [projects]);
  const activeIds = useMemo(() => new Set(activeProjects.map((p) => p.id)), [activeProjects]);
  const apts = useMemo(() => apartments.filter((a) => activeIds.has(a.project_id)), [apartments, activeIds]);
  const projById = useMemo(() => new Map(activeProjects.map((p) => [p.id, p])), [activeProjects]);
  const projName = (p: Project) => (p as unknown as Record<string, string>)[`name_${lang}`] || p.name_uz;
  const years = useMemo(() => Array.from(new Set(activeProjects.map((p) => p.delivery_year).filter(Boolean))).sort() as number[], [activeProjects]);

  // Admin kiritgan real xonadon maydonlaridan avtomatik oraliqlar hosil qilamiz.
  // Faqat xonadon MAVJUD bo'lgan oraliqlar ko'rsatiladi — shuning uchun mijoz
  // qaysi birini tanlasa ham har doim natija chiqadi, bo'sh natija bo'lmaydi.
  // Maydon oraliqlari (170 gacha) — o'nlik kasrlar ko'p tugma hosil qilmasligi, filtr
  // toza va tushunarli bo'lishi uchun. Faqat xonadon MAVJUD oraliqlar ko'rsatiladi.
  const areaRanges = useMemo(() => {
    const edges = [0, 60, 75, 90, 110, 130, 150, 170, Infinity];
    const out: { min: number; max: number; label: string; count: number }[] = [];
    for (let i = 0; i < edges.length - 1; i++) {
      const lo = edges[i];
      const hi = edges[i + 1];
      const count = apts.filter((a) => a.area >= lo && a.area < hi).length;
      if (count === 0) continue;
      const label = lo === 0 ? `≤ ${hi}` : hi === Infinity ? `${lo}+` : `${lo}–${hi}`;
      out.push({ min: lo, max: hi, label, count });
    }
    return out;
  }, [apts]);

  const [rooms, setRooms] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | 'all'>('all');
  const [year, setYear] = useState<number | 'all'>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [areaSel, setAreaSel] = useState<{ min: number; max: number } | null>(null);

  // Har kategoriyada nechta xonadon borligi
  const catCount = (key: string) => apts.filter((a) => projById.get(a.project_id)?.categories?.includes(key)).length;

  // Loyihalar tartibi — xonadonlar shu tartibda "ketma-ket" ko'rinadi
  const projOrder = useMemo(() => new Map(activeProjects.map((p, i) => [p.id, i])), [activeProjects]);

  const filtered = useMemo(() => {
    return apts.filter((a) => {
      const p = projById.get(a.project_id);
      if (rooms !== null && (rooms === 4 ? a.rooms < 4 : a.rooms !== rooms)) return false;
      if (projectId !== 'all' && a.project_id !== projectId) return false;
      if (areaSel && (a.area < areaSel.min || a.area >= areaSel.max)) return false;
      if (year !== 'all' && p?.delivery_year !== year) return false;
      // Ko'p tanlov: loyiha BARCHA tanlangan joylashuvlarga ega bo'lishi kerak (AND)
      if (cats.length && !cats.every((k) => p?.categories?.includes(k))) return false;
      return true;
    }).sort((a, b) =>
      (projOrder.get(a.project_id) ?? 999) - (projOrder.get(b.project_id) ?? 999) ||
      a.floor - b.floor ||
      a.number.localeCompare(b.number)
    );
  }, [apts, rooms, projectId, year, areaSel, cats, projById, projOrder]);

  // Kategoriya tanlanganda — shu kategoriyaga mos loyihalar (admin belgilagan)
  const matchingProjects = useMemo(
    () => (cats.length ? activeProjects.filter((p) => cats.every((k) => p.categories?.includes(k))) : []),
    [cats, activeProjects]
  );

  // Filtr o'zgarganda ko'rinadigan sonni 9 ga qaytaramiz (render vaqtida moslash — React tavsiyasi)
  const filterSig = `${rooms}|${projectId}|${year}|${areaSel?.min ?? ''}-${areaSel?.max ?? ''}|${cats.join(',')}`;
  const [visible, setVisible] = useState(9);
  const [prevSig, setPrevSig] = useState(filterSig);
  if (filterSig !== prevSig) {
    setPrevSig(filterSig);
    setVisible(9);
  }
  const shown = filtered.slice(0, visible);

  const reset = () => { setRooms(null); setProjectId('all'); setYear('all'); setCats([]); setAreaSel(null); };

  // Bitta xonadon kartasi (loyiha guruhlari ichida ishlatiladi)
  const renderCard = (a: Apartment) => {
    const p = projById.get(a.project_id);
    const pick = () => {
      onSelect?.({ id: a.id, number: a.number, rooms: a.rooms, area: a.area, floor: a.floor, projectName: p ? projName(p) : '' });
      scrollToCalc();
    };
    return (
      <div key={a.id} role="button" tabIndex={0}
        onClick={pick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }}
        className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100 overflow-hidden">
          {a.plan_image ? (
            <img src={a.plan_image} alt={`${a.number}-${t.plan}`} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
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
          <div className="mt-4 w-full py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-bold text-center group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-1.5">
            <Calculator size={13} /> {t.calc}
          </div>
          <Link href={`/${lang}/projects/${a.project_id}`} onClick={(e) => e.stopPropagation()}
            className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-400 hover:text-primary font-medium transition-colors">
            {t.details} <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    );
  };

  // Ko'rinadigan xonadonlarni LOYIHA bo'yicha guruhlaymiz (ketma-ket)
  const groups: { pid: number; items: Apartment[] }[] = [];
  const groupIdx = new Map<number, number>();
  for (const a of shown) {
    if (!groupIdx.has(a.project_id)) { groupIdx.set(a.project_id, groups.length); groups.push({ pid: a.project_id, items: [] }); }
    groups[groupIdx.get(a.project_id)!].items.push(a);
  }

  if (apts.length === 0) return null;

  return (
    <section id="apartments" className="py-24 px-6 bg-brand-mesh">
      <div className="max-container">
        <div className="text-center mb-10">
          <span className="eyebrow eyebrow--center mb-4">{t.tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">{t.title}</h2>
        </div>

        {/* Joylashuv bo'yicha rasmli kategoriya filtri */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
            <Building2 size={15} className="text-accent" /> {t.byLoc}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((c) => {
              const isActive = cats.includes(c.key);
              const n = catCount(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => setCats((prev) => prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key])}
                  className={`group relative h-24 sm:h-28 rounded-2xl overflow-hidden text-left transition-all duration-300 ${
                    isActive ? 'ring-4 ring-accent shadow-xl -translate-y-1' : 'ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
                  <img src={c.image} alt={c.label[lang]} loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                    <div className="text-lg leading-none mb-0.5">{c.emoji}</div>
                    <div className="font-bold text-xs leading-tight drop-shadow">{c.label[lang]}</div>
                    {n > 0 && <div className="text-[10px] text-white/80 font-semibold">{n}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kategoriya tanlanganda — o'sha joyga mos loyihalar (admin belgilagan) */}
        {cats.length > 0 && matchingProjects.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <Building2 size={15} className="text-accent" /> {t.matchProj}
              <span className="text-accent font-black">({matchingProjects.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingProjects.map((p) => (
                <ProjectCard key={p.id} project={p} lang={lang} />
              ))}
            </div>
          </div>
        )}

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

              {areaRanges.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"><Maximize2 size={14} /> {t.area}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {areaRanges.map((r) => {
                      const active = areaSel?.min === r.min && areaSel?.max === r.max;
                      return (
                        <button key={r.label} onClick={() => setAreaSel(active ? null : { min: r.min, max: r.max })}
                          className={`px-3 h-9 rounded-lg text-sm font-bold flex items-center justify-between gap-1.5 transition-all ${active ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                          <span>{r.label}</span>
                          <span className={`text-[10px] font-black ${active ? 'text-accent' : 'text-gray-400'}`}>{r.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm"><span className="text-gray-400">{t.found}: </span><span className="font-black text-primary">{filtered.length}</span></div>
                <button onClick={reset} className="text-sm font-bold text-gray-400 hover:text-primary">{t.reset}</button>
              </div>
            </div>
          </aside>

          {/* O'ng: xonadonlar */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium mb-5">{t.empty}</p>
                <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-accent hover:text-primary transition-all">
                  {t.reset}
                </button>
              </div>
            ) : (
              <>
                {groups.map((g) => {
                  const proj = projById.get(g.pid);
                  return (
                    <div key={g.pid} className="mb-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 text-base font-bold text-primary">
                        <Building2 size={17} className="text-accent" /> {proj ? projName(proj) : ''}
                        <span className="text-gray-400 text-sm font-medium">· {g.items.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {g.items.map((a) => renderCard(a))}
                      </div>
                    </div>
                  );
                })}
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
