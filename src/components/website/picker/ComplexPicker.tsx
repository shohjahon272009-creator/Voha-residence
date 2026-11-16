/* eslint-disable @next/next/no-img-element */
'use client';

// "Xonadon tanlash": majmua → blok → qavat → xonadon (bosqichma-bosqich).
// 3D — faqat konsept ko'rinish va ixtiyoriy; hamma amal ro'yxat/tugmalar orqali ham bajariladi.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, Box, List, SlidersHorizontal, Building2 } from 'lucide-react';
import type { Apartment, Project } from '@/lib/types';
import {
  areaBounds, availableShare, blockApartments, buildModel, countAvailableMatching, EMPTY_FILTERS, EMPTY_SEL,
  floorKey, floorOf, formatHash, hasFilters, parseHash, resolveSel, similarApartments, statusKind,
  type AptRef, type BlockModel, type Filters, type FloorGroup, type Sel,
} from './data';
import { getT, type Dict, type PickerLang } from './i18n';
import { Sheet, StatusBadge, statusText, useCores, useMedia, useWebGL } from './ui';
import type { EngineBlock, EnginePick, EngineSel } from './engine';
import Scene3D from './Scene3D';
import FloorGrid from './FloorGrid';
import ApartmentDetail from './ApartmentDetail';
import FilterPanel from './FilterPanel';

type Props = {
  lang: PickerLang;
  projects: Project[];
  apartments: Apartment[];
  onRequest: (apt: Apartment, project: Project) => void;
  renderPayment?: (apt: Apartment) => ReactNode;   // detal ichidagi to'lov bloki
  // Ota komponent o'z oynasini (murojaat formasi) ochganda mobil sheet vaqtincha yopiladi —
  // ikki dialog ustma-ust tushmaydi; oyna yopilgach xonadon tafsiloti qaytadi
  suspendSheet?: boolean;
};

type Mode = '3d' | 'list';

const projName = (p: Project, lang: PickerLang) => (p as unknown as Record<string, string>)[`name_${lang}`] || p.name_uz;
const blockShort = (b: BlockModel, t: Dict, lang: PickerLang) => (b.project.block_no ? t.blockN(b.project.block_no) : projName(b.project, lang));
const floorText = (g: FloorGroup, t: Dict) => (g.floor === null ? t.unknownFloor : t.floorN(g.floor));

const btnGhost = 'inline-flex min-h-[44px] items-center justify-center gap-1 rounded-v-md border border-line bg-surface px-3 text-small font-semibold text-ink disabled:opacity-50';

export default function ComplexPicker({ lang, projects, apartments, onRequest, renderPayment, suspendSheet }: Props) {
  const t = getT(lang);
  const model = useMemo(() => buildModel(projects, apartments), [projects, apartments]);
  const bounds = useMemo(() => areaBounds(model), [model]);

  const [sel, setSel] = useState<Sel>(EMPTY_SEL);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [userMode, setUserMode] = useState<Mode | null>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restoredRef = useRef(false);
  // Daraja almashganda sarlavhaga fokus berish so'rovi (hisoblagich)
  const [focusReq, setFocusReq] = useState(0);

  // Qurilma: 3D faqat keng ekran, 4 dan ko'p yadro, harakat kamaytirilmagan va WebGL bor bo'lsa
  const wide = useMedia('(min-width: 768px)');
  const desktop = useMedia('(min-width: 1024px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const cores = useCores();
  const autoCandidate = wide && !reduced && cores > 4;
  const webgl = useWebGL(autoCandidate || userMode === '3d');
  const mode: Mode = failed ? 'list' : (userMode ?? (autoCandidate ? '3d' : 'list')) === '3d' && webgl ? '3d' : 'list';
  const show3dNote = failed || (userMode === '3d' && !webgl);

  const resolved = useMemo(() => resolveSel(model, sel), [model, sel]);
  const { block, floor, apt } = resolved;
  const level = apt ? 'apt' : floor ? 'floor' : block ? 'block' : 'complex';
  const hash = formatHash({ pid: block?.id ?? null, fk: floor?.key ?? null, aid: apt?.id ?? null });

  // Bo'lim ekranga yaqinlashganda 3D yuklanadi
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setNear(true), 0);
      return () => window.clearTimeout(id);
    }
    // Yaqinlashganda ham darhol emas — brauzer bo'shaganda (sahifaning birinchi chizilishiga xalaqit bermasin)
    let idle = 0;
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      idle = hasIdle ? window.requestIdleCallback(() => setNear(true), { timeout: 2500 }) : window.setTimeout(() => setNear(true), 600);
    }, { rootMargin: '200px 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      if (hasIdle) window.cancelIdleCallback(idle); else window.clearTimeout(idle);
    };
  }, []);

  // Deep link: yuklanganda hash'dan tiklaymiz, keyin o'zgarishlarni kuzatamiz
  useEffect(() => {
    const id = window.setTimeout(() => {
      const s = parseHash(window.location.hash);
      restoredRef.current = true;
      if (s) {
        setSel(s);
        rootRef.current?.scrollIntoView({ block: 'start' });
      }
    }, 0);
    const onHash = () => { const s = parseHash(window.location.hash); if (s) setSel(s); };
    window.addEventListener('hashchange', onHash);
    return () => { window.clearTimeout(id); window.removeEventListener('hashchange', onHash); };
  }, []);

  useEffect(() => {
    if (!restoredRef.current) return;
    const cur = window.location.hash;
    if (hash === cur) return;
    // Boshqa bo'limlarning hash'iga tegmaymiz
    if (!hash && !cur.startsWith('#xonadon=')) return;
    window.history.replaceState(window.history.state, '', hash || window.location.pathname + window.location.search);
  }, [hash]);

  // Daraja almashganda fokus yangi sarlavhaga (ro'yxatdagi tugma yo'qolib ketmasligi uchun)
  useEffect(() => {
    if (focusReq) headingRef.current?.focus();
  }, [focusReq]);

  // ---- Navigatsiya ----
  const go = useCallback((s: Sel, moveFocus = true) => { setSel(s); if (moveFocus) setFocusReq((n) => n + 1); }, []);
  const goBlock = (b: BlockModel) => go({ pid: b.id, fk: null, aid: null });
  const goFloor = (b: BlockModel, g: FloorGroup) => go({ pid: b.id, fk: g.key, aid: null });
  const openApt = (a: Apartment) => go({ pid: a.project_id, fk: floorKey(floorOf(a)), aid: a.id }, false);
  const closeApt = () => { if (block && floor) go({ pid: block.id, fk: floor.key, aid: null }, false); };
  const reset = () => go(EMPTY_SEL);
  const back = () => {
    if (apt) closeApt();
    else if (floor && block) goBlock(block);
    else go(EMPTY_SEL);
  };

  const bIdx = block ? model.blocks.indexOf(block) : -1;
  const fIdx = block && floor ? block.floors.indexOf(floor) : -1;
  const aIdx = floor && apt ? floor.apts.indexOf(apt) : -1;
  const prevBlock = bIdx > 0 ? model.blocks[bIdx - 1] : null;
  const nextBlock = bIdx >= 0 && bIdx < model.blocks.length - 1 ? model.blocks[bIdx + 1] : null;
  const prevFloor = block && fIdx > 0 ? block.floors[fIdx - 1] : null;
  const nextFloor = block && fIdx >= 0 && fIdx < block.floors.length - 1 ? block.floors[fIdx + 1] : null;
  const prevApt = floor && aIdx > 0 ? floor.apts[aIdx - 1] : null;
  const nextApt = floor && aIdx >= 0 && aIdx < floor.apts.length - 1 ? floor.apts[aIdx + 1] : null;

  // ---- Filtr bo'yicha hisoblar ----
  const freeByBlock = useMemo(() => new Map(model.blocks.map((b) => [b.id, countAvailableMatching(blockApartments(b), filters)])), [model, filters]);
  const scopeFree = block ? freeByBlock.get(block.id) ?? 0 : Array.from(freeByBlock.values()).reduce((s, n) => s + n, 0);
  const filtered = hasFilters(filters);

  const similar = useMemo(() => (apt && statusKind(apt.status) !== 'available' ? similarApartments(model, apt) : []), [model, apt]);

  // ---- 3D uchun ma'lumot ----
  const engineBlocks = useMemo<EngineBlock[]>(() => model.blocks.map((b) => ({
    id: b.id,
    label: blockShort(b, t, lang),
    maxFloor: b.maxFloor,
    floors: b.floors.filter((g) => g.floor !== null).map((g) => ({
      floor: g.floor as number,
      total: g.counts.total,
      available: g.counts.available,
      apts: g.apts.map((a) => ({ id: a.id, number: String(a.number ?? ''), status: statusKind(a.status) })),
    })),
  })), [model, t, lang]);
  const ePid = block?.id ?? null, eFloor = floor?.floor ?? null, eAid = apt?.id ?? null;
  const engineSel = useMemo<EngineSel>(() => ({ pid: ePid, floor: eFloor, aid: eAid }), [ePid, eFloor, eAid]);
  const onPick = useCallback((p: EnginePick) => {
    setSel((cur) => {
      if (cur.pid !== p.pid) return { pid: p.pid, fk: null, aid: null };
      return { pid: p.pid, fk: floorKey(p.floor), aid: p.aid };
    });
  }, []);
  const onFail = useCallback(() => setFailed(true), []);

  // ---- Matnlar ----
  const crumbs: { label: string; onClick?: () => void }[] = [{ label: t.complex, onClick: block ? reset : undefined }];
  if (block) crumbs.push({ label: blockShort(block, t, lang), onClick: floor ? () => goBlock(block) : undefined });
  if (block && floor) crumbs.push({ label: floorText(floor, t), onClick: apt ? closeApt : undefined });
  if (apt) crumbs.push({ label: t.aptN(apt.number) });

  const live = apt
    ? t.liveApt(apt.number, statusText(statusKind(apt.status), t))
    : floor && block
      ? t.liveFloor(blockShort(block, t, lang), floorText(floor, t), countAvailableMatching(floor.apts, filters))
      : block
        ? t.liveBlock(blockShort(block, t, lang), freeByBlock.get(block.id) ?? 0)
        : t.liveComplex(model.blocks.length);

  const heading = floor ? floorText(floor, t) : block ? projName(block.project, lang) : t.chooseBlock;
  const labelOf = (r: AptRef) => `${blockShort(r.block, t, lang)} · ${floorText(r.floor, t)}`;

  const detailProps = apt && block && floor ? {
    apt,
    blockLabel: blockShort(block, t, lang),
    floorLabel: floorText(floor, t),
    t,
    similar,
    labelOf,
    onRequest: () => onRequest(apt, block.project),
    payment: renderPayment?.(apt),
    onPrev: prevApt ? () => openApt(prevApt) : undefined,
    onNext: nextApt ? () => openApt(nextApt) : undefined,
    onPick: (r: AptRef) => openApt(r.apt),
  } : null;

  return (
    <section ref={rootRef} id="xonadon-picker" aria-labelledby={titleId} className="bg-canvas text-ink">
      <div className="mx-auto max-w-page px-[var(--v-gutter)] py-[var(--v-section-y)]">
        <p className="text-caption uppercase text-accent-text">{t.tag}</p>
        <h2 id={titleId} className="mt-4 text-h1 font-montserrat text-ink">{t.title}</h2>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{t.hint}</p>

        {/* Boshqaruv: ko'rinish almashtirgich va mobil filtr tugmasi */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t.viewLabel} className="inline-flex rounded-v-md border border-line bg-surface p-1">
            {(['3d', 'list'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => { setUserMode(m); if (m === '3d') setFailed(false); }}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-v-sm px-3 text-small font-semibold ${mode === m ? 'bg-inverse text-ink-inverse' : 'text-ink'}`}
              >
                {m === '3d' ? <Box size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}
                {m === '3d' ? t.view3d : t.viewList}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setFilterOpen(true)} className={`${btnGhost} lg:hidden`} aria-haspopup="dialog">
            <SlidersHorizontal size={16} aria-hidden="true" />
            {t.filter}{filtered ? ' •' : ''}
          </button>
        </div>
        {show3dNote && <p className="mt-2 text-small text-ink-muted">{t.no3d}</p>}

        {/* Desktop filtr — mobilda sheet ichida */}
        <div className="mt-4 hidden rounded-v-lg border border-line bg-surface p-4 lg:block">
          <FilterPanel value={filters} onChange={setFilters} bounds={bounds} t={t} />
        </div>

        {/* Breadcrumb + Orqaga / Boshidan */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label={t.breadcrumb}>
            <ol className="flex flex-wrap items-center gap-1 text-small">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true" className="text-ink-muted">›</span>}
                  {c.onClick ? (
                    <button type="button" onClick={c.onClick} className="min-h-[44px] rounded-v-sm px-1.5 font-semibold text-accent-text underline underline-offset-4">{c.label}</button>
                  ) : (
                    <span aria-current="page" className="px-1.5 font-semibold text-ink">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {level !== 'complex' && (
            <div className="flex gap-2">
              <button type="button" onClick={back} className={btnGhost}><ChevronLeft size={16} aria-hidden="true" />{t.back}</button>
              <button type="button" onClick={reset} className={btnGhost}><ChevronsLeft size={16} aria-hidden="true" />{t.reset}</button>
            </div>
          )}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">{live}</p>

        <div className="mt-4 lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            {mode === '3d' && (
              <div className="mb-2 aspect-[4/3] md:aspect-[16/10]">
                {near ? (
                  <Scene3D
                    blocks={engineBlocks}
                    sel={engineSel}
                    reducedMotion={reduced}
                    label={t.canvasLabel(live)}
                    conceptLabel={t.conceptLabel}
                    loadingLabel={t.loading3d}
                    onPick={onPick}
                    onFail={onFail}
                  />
                ) : (
                  <div className="h-full w-full rounded-v-lg border border-line bg-surface-sunken" aria-hidden="true" />
                )}
              </div>
            )}
            {mode === '3d' && <p className="mb-4 text-small text-ink-muted">{t.hint3d}</p>}

            {/* Har bosqichda oldingi/keyingi */}
            {level === 'block' && (
              <div className="mb-4 flex gap-2">
                <button type="button" disabled={!prevBlock} onClick={() => prevBlock && goBlock(prevBlock)} className={`${btnGhost} flex-1`}><ChevronLeft size={16} aria-hidden="true" />{t.prevBlock}</button>
                <button type="button" disabled={!nextBlock} onClick={() => nextBlock && goBlock(nextBlock)} className={`${btnGhost} flex-1`}>{t.nextBlock}<ChevronRight size={16} aria-hidden="true" /></button>
              </div>
            )}
            {(level === 'floor' || level === 'apt') && block && (
              <div className="mb-4 flex gap-2">
                <button type="button" disabled={!prevFloor} onClick={() => prevFloor && goFloor(block, prevFloor)} className={`${btnGhost} flex-1`}><ChevronLeft size={16} aria-hidden="true" />{t.prevFloor}</button>
                <button type="button" disabled={!nextFloor} onClick={() => nextFloor && goFloor(block, nextFloor)} className={`${btnGhost} flex-1`}>{t.nextFloor}<ChevronRight size={16} aria-hidden="true" /></button>
              </div>
            )}

            <h3 ref={headingRef} tabIndex={-1} className="mb-3 text-h3 text-ink outline-none">{heading}</h3>

            {filtered && scopeFree === 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-v-lg border border-line bg-surface p-4">
                <p className="text-body font-semibold text-ink">{t.emptyFilter}</p>
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="min-h-[44px] rounded-v-md bg-cta px-4 text-body font-semibold text-cta-ink">{t.clearFilter}</button>
              </div>
            )}

            {level === 'complex' && (
              model.blocks.length === 0 ? (
                <p className="text-body text-ink-muted">{t.noBlocks}</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {model.blocks.map((b) => {
                    const free = freeByBlock.get(b.id) ?? 0;
                    const c = b.counts;
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => goBlock(b)}
                          className="group flex w-full flex-col overflow-hidden rounded-v-lg border border-line bg-surface text-left shadow-v-md transition-transform duration-v-base ease-v motion-safe:hover:-translate-y-0.5"
                        >
                          <span className="relative block aspect-[16/10] w-full bg-surface-sunken">
                            {b.project.main_image ? (
                              <img src={b.project.main_image} alt="" loading="lazy" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-ink-muted"><Building2 size={36} aria-hidden="true" /></span>
                            )}
                          </span>
                          <span className="flex flex-col gap-1 p-4">
                            <span className="text-h3 text-ink">{projName(b.project, lang)}</span>
                            <span className="text-body font-semibold text-st-available">● {t.freeN(free)}</span>
                            <span className="text-small text-ink-muted">{t.floorsN(b.maxFloor)}</span>
                            {c.total > 0 && (
                              <span className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-st-sold-bg" aria-hidden="true">
                                <span className="bg-st-available" style={{ width: `${(c.available / c.total) * 100}%` }} />
                                <span className="bg-st-reserved" style={{ width: `${(c.reserved / c.total) * 100}%` }} />
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            )}

            {level === 'block' && block && (
              block.floors.length === 0 ? (
                <p className="text-body text-ink-muted">{t.noApts}</p>
              ) : (
                <>
                  <p className="mb-2 text-small text-ink-muted">{t.chooseFloor}</p>
                  <ul className="flex flex-col gap-2">
                    {/* Bino kabi: yuqori qavat tepada, noma'lum qavat oxirida */}
                    {[...block.floors.filter((g) => g.floor !== null).reverse(), ...block.floors.filter((g) => g.floor === null)].map((g) => {
                      const free = countAvailableMatching(g.apts, filters);
                      return (
                        <li key={g.key}>
                          <button
                            type="button"
                            onClick={() => goFloor(block, g)}
                            className="flex min-h-[44px] w-full items-center gap-3 rounded-v-md border border-line bg-surface px-3 py-2 text-left"
                          >
                            <span className="w-28 shrink-0 text-body font-semibold text-ink">{floorText(g, t)}</span>
                            <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-st-sold-bg" aria-hidden="true">
                              <span className="bg-st-available" style={{ width: `${availableShare(g.counts) * 100}%` }} />
                            </span>
                            <span className="shrink-0 text-small text-ink-muted">{t.freeOf(free, g.counts.total)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )
            )}

            {(level === 'floor' || level === 'apt') && block && floor && (
              <>
                <p className="mb-3 text-small text-ink-muted">{t.chooseApt} · {t.freeOf(countAvailableMatching(floor.apts, filters), floor.counts.total)}</p>
                <FloorGrid
                  key={`${block.id}:${floor.key}`}
                  apts={floor.apts}
                  selectedId={apt?.id ?? null}
                  filters={filters}
                  t={t}
                  label={`${blockShort(block, t, lang)}, ${floorText(floor, t)}`}
                  onOpen={openApt}
                />
              </>
            )}
          </div>

          {/* Desktop: o'ng panel (4/12) */}
          <aside className="hidden lg:col-span-4 lg:block" aria-label={t.detail}>
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-v-xl border border-line bg-surface p-5 shadow-v-md" data-lenis-prevent="">
              {desktop && detailProps ? (
                <ApartmentDetail {...detailProps} />
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-body text-ink-muted">{t.selectHint}</p>
                  <div>
                    <p className="mb-2 text-small font-semibold text-ink">{t.legend}</p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge kind="available" t={t} />
                      <StatusBadge kind="reserved" t={t} />
                      <StatusBadge kind="sold" t={t} />
                    </div>
                  </div>
                  <p className="text-small text-ink-muted">{t.price}</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Mobil: belgilar (desktopda o'ng panelda) */}
        <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
          <StatusBadge kind="available" t={t} />
          <StatusBadge kind="reserved" t={t} />
          <StatusBadge kind="sold" t={t} />
        </div>
      </div>

      {/* Mobil: xonadon tafsiloti — bottom sheet */}
      {!desktop && detailProps && !suspendSheet && (
        <Sheet
          title={t.aptN(detailProps.apt.number)}
          closeLabel={t.close}
          onClose={closeApt}
          footer={<button type="button" onClick={closeApt} className={`${btnGhost} w-full`}>{t.backToFloor}</button>}
        >
          <ApartmentDetail {...detailProps} compact />
        </Sheet>
      )}

      {/* Mobil: filtr — bottom sheet */}
      {!desktop && filterOpen && (
        <Sheet
          title={t.filterTitle}
          closeLabel={t.close}
          onClose={() => setFilterOpen(false)}
          footer={<button type="button" onClick={() => setFilterOpen(false)} className="min-h-[44px] w-full rounded-v-md bg-cta px-4 text-body font-semibold text-cta-ink">{t.apply}</button>}
        >
          <FilterPanel value={filters} onChange={setFilters} bounds={bounds} t={t} />
        </Sheet>
      )}
    </section>
  );
}
