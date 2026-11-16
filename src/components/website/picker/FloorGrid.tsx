'use client';

// Qavat kataklari: roving tabindex, strelkalar bilan yurish, Enter — batafsil.
import { useRef, useState, type KeyboardEvent } from 'react';
import type { Apartment } from '@/lib/types';
import { matchesFilter, statusKind, type Filters } from './data';
import { STATUS_CLS, STATUS_ICON, statusText } from './ui';
import type { Dict } from './i18n';

type Props = {
  apts: Apartment[];
  selectedId: number | null;
  filters: Filters;
  t: Dict;
  label: string;
  onOpen: (a: Apartment) => void;
};

export default function FloorGrid({ apts, selectedId, filters, t, label, onOpen }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Boshlang'ich fokus — tanlangan xonadon (ota komponent qavat almashganda key bilan qayta yaratadi)
  const [focusIdx, setFocusIdx] = useState(() => Math.max(0, apts.findIndex((a) => a.id === selectedId)));
  const active = Math.min(focusIdx, Math.max(0, apts.length - 1));

  const move = (to: number) => {
    const i = Math.max(0, Math.min(apts.length - 1, to));
    setFocusIdx(i);
    btnRefs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const grid = gridRef.current;
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1 : 1;
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: apts.length - 1 };
    if (e.key in map) { e.preventDefault(); move(map[e.key]); }
  };

  return (
    <div>
      <div ref={gridRef} role="group" aria-label={label} className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
        {apts.map((a, i) => {
          const k = statusKind(a.status);
          const match = matchesFilter(a, filters);
          const sel = a.id === selectedId;
          return (
            <button
              key={a.id}
              ref={(el) => { btnRefs.current[i] = el; }}
              type="button"
              tabIndex={i === active ? 0 : -1}
              aria-pressed={sel}
              aria-label={`${t.aptN(a.number)}, ${t.roomsN(a.rooms)}, ${a.area} ${t.m2}, ${statusText(k, t)}`}
              onFocus={() => setFocusIdx(i)}
              onKeyDown={(e) => onKey(e, i)}
              onClick={() => onOpen(a)}
              className={`flex min-h-[44px] flex-col items-start gap-0.5 rounded-v-md border px-2.5 py-2 text-left transition-colors duration-v-base ease-v ${match ? STATUS_CLS[k] : 'border-dashed bg-surface text-ink-muted'} ${
                sel ? 'border-accent-text ring-2 ring-accent-text' : 'border-line'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-1 text-body font-semibold">
                {t.aptN(a.number)}
                <span aria-hidden="true">{STATUS_ICON[k]}</span>
              </span>
              <span className="text-small">{t.roomsN(a.rooms)} · {a.area} {t.m2}</span>
              <span className="text-small">{statusText(k, t)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-small text-ink-muted">{t.gridHint}</p>
    </div>
  );
}
