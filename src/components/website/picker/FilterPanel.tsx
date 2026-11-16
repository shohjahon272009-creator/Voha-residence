'use client';

// Filtr: xonalar (1/2/3/4+) va maydon oralig'i. Darhol qo'llanadi.
import { useId } from 'react';
import { hasFilters, type Filters } from './data';
import type { Dict } from './i18n';

type Props = { value: Filters; onChange: (f: Filters) => void; bounds: { min: number; max: number }; t: Dict };

const ROOMS = [1, 2, 3, 4];

export default function FilterPanel({ value, onChange, bounds, t }: Props) {
  const id = useId();
  const toggle = (r: number) => {
    const has = value.rooms.includes(r);
    onChange({ ...value, rooms: has ? value.rooms.filter((x) => x !== r) : [...value.rooms, r].sort() });
  };
  const num = (s: string): number | null => {
    if (s.trim() === '') return null;
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-6">
      <fieldset>
        <legend className="mb-1.5 text-small font-semibold text-ink">{t.rooms}</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={value.rooms.length === 0}
            onClick={() => onChange({ ...value, rooms: [] })}
            className={`min-h-[44px] min-w-[44px] rounded-v-md border px-3 text-small font-semibold ${value.rooms.length === 0 ? 'border-inverse bg-inverse text-ink-inverse' : 'border-line bg-surface text-ink'}`}
          >
            {t.roomsAll}
          </button>
          {ROOMS.map((r) => {
            const on = value.rooms.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(r)}
                className={`min-h-[44px] min-w-[44px] rounded-v-md border px-3 text-small font-semibold ${on ? 'border-inverse bg-inverse text-ink-inverse' : 'border-line bg-surface text-ink'}`}
              >
                {r === 4 ? '4+' : r}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-small font-semibold text-ink">{t.area}, {t.m2}</legend>
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-min`} className="sr-only">{t.areaMinLabel}</label>
          <input
            id={`${id}-min`}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={bounds.min ? `${t.areaFrom} ${bounds.min}` : t.areaFrom}
            value={value.areaMin ?? ''}
            onChange={(e) => onChange({ ...value, areaMin: num(e.target.value) })}
            className="h-11 w-32 rounded-v-md border border-line bg-surface px-3 text-body text-ink"
          />
          <span aria-hidden="true" className="text-ink-muted">—</span>
          <label htmlFor={`${id}-max`} className="sr-only">{t.areaMaxLabel}</label>
          <input
            id={`${id}-max`}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={bounds.max ? `${t.areaTo} ${bounds.max}` : t.areaTo}
            value={value.areaMax ?? ''}
            onChange={(e) => onChange({ ...value, areaMax: num(e.target.value) })}
            className="h-11 w-32 rounded-v-md border border-line bg-surface px-3 text-body text-ink"
          />
        </div>
      </fieldset>

      {hasFilters(value) && (
        <button type="button" onClick={() => onChange({ rooms: [], areaMin: null, areaMax: null })} className="min-h-[44px] self-start rounded-v-md px-3 text-small font-semibold text-accent-text underline underline-offset-4 lg:self-end">
          {t.clearFilter}
        </button>
      )}
    </div>
  );
}
