/* eslint-disable @next/next/no-img-element */
'use client';

// Xonadon tafsiloti: narx ko'rsatilmaydi (biznes qoidasi), sotilganda — o'xshash bo'sh xonadonlar.
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, Sofa } from 'lucide-react';
import type { Apartment } from '@/lib/types';
import { statusKind, type AptRef } from './data';
import { StatusBadge } from './ui';
import type { Dict } from './i18n';

type Props = {
  apt: Apartment;
  blockLabel: string;
  floorLabel: string;
  t: Dict;
  similar: AptRef[];
  labelOf: (r: AptRef) => string;     // o'xshash xonadon uchun "1-blok · 5-qavat"
  onRequest: () => void;
  payment?: ReactNode;                  // bo'sh xonadon uchun to'lov bloki (ixtiyoriy)
  onPrev?: () => void;
  onNext?: () => void;
  onPick: (r: AptRef) => void;
  compact?: boolean;                    // mobil sheet ichida sarlavha alohida
};

export default function ApartmentDetail({ apt, blockLabel, floorLabel, t, similar, labelOf, onRequest, payment, onPrev, onNext, onPick, compact }: Props) {
  const k = statusKind(apt.status);
  const facts: [string, string][] = [
    [t.rooms, String(apt.rooms ?? '—')],
    [t.area, apt.area ? `${apt.area} ${t.m2}` : '—'],
    [t.floor, floorLabel],
    [t.block, blockLabel],
  ];

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-caption uppercase text-accent-text">{t.detail}</p>
            <h3 className="text-h3 text-ink">{t.aptN(apt.number)}</h3>
          </div>
          <StatusBadge kind={k} t={t} />
        </div>
      )}
      {compact && <StatusBadge kind={k} t={t} className="self-start" />}

      <dl className="grid grid-cols-2 gap-2">
        {facts.map(([l, v]) => (
          <div key={l} className="rounded-v-md bg-surface-sunken px-3 py-2">
            <dt className="text-small text-ink-muted">{l}</dt>
            <dd className="text-body font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Planirovka yoki bo'sh holat */}
      <figure className="overflow-hidden rounded-v-md border border-line bg-surface">
        {apt.plan_image ? (
          <img src={apt.plan_image} alt={`${t.plan}: ${t.aptN(apt.number)}`} loading="lazy" className="aspect-[4/3] w-full object-contain p-2" />
        ) : (
          <div className="grid w-full place-items-center gap-1 bg-surface-sunken px-4 py-5 text-center">
            <ImageOff size={28} aria-hidden="true" className="text-ink-muted" />
            <p className="text-body font-semibold text-ink">{t.planSoon}</p>
            <p className="text-small text-ink-muted">{t.planSoonHint}</p>
          </div>
        )}
        <figcaption className="border-t border-line px-3 py-1.5 text-small text-ink-muted">{t.plan}</figcaption>
      </figure>

      {/* Interyer: rasm bo'lmasa — aniq "konsept" deb belgilangan joy egallovchi */}
      <figure className="overflow-hidden rounded-v-md border border-line">
        {apt.image ? (
          <img src={apt.image} alt={t.interiorPhoto} loading="lazy" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="relative grid h-20 w-full place-items-center bg-surface-sunken">
            <Sofa size={28} aria-hidden="true" className="text-ink-muted" />
            <span className="absolute right-2 top-2 rounded-full bg-surface px-2 py-0.5 text-caption uppercase text-ink">{t.conceptBadge}</span>
          </div>
        )}
        <figcaption className="border-t border-line px-3 py-1.5 text-small text-ink-muted">{apt.image ? t.interiorPhoto : t.interior}</figcaption>
      </figure>

      <p className="rounded-v-md bg-surface-sunken px-3 py-2 text-body font-semibold text-ink">{t.price}</p>
      {k === 'available' && payment}

      {k === 'sold' && <p className="text-body text-ink">{t.soldNote}</p>}
      {k === 'reserved' && <p className="text-body text-ink">{t.reservedNote}</p>}

      {k !== 'sold' && (
        <button type="button" onClick={onRequest} className="min-h-[52px] w-full rounded-v-md bg-cta px-4 py-2.5 text-body font-bold text-cta-ink shadow-v-md transition duration-v-fast ease-v hover:brightness-105 active:scale-[0.99]">
          {t.request}
        </button>
      )}

      {k !== 'available' && (
        <section aria-label={t.similar} className="flex flex-col gap-2">
          <h4 className="text-body font-semibold text-ink">{t.similar}</h4>
          {similar.length ? (
            <ul className="flex flex-col gap-2">
              {similar.map((r) => (
                <li key={r.apt.id}>
                  <button
                    type="button"
                    onClick={() => onPick(r)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-v-md border border-line bg-surface px-3 py-2 text-left"
                  >
                    <span>
                      <span className="block text-body font-semibold text-ink">{t.aptN(r.apt.number)} · {t.roomsN(r.apt.rooms)} · {r.apt.area} {t.m2}</span>
                      <span className="block text-small text-ink-muted">{labelOf(r)}</span>
                    </span>
                    <StatusBadge kind="available" t={t} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-small text-ink-muted">{t.noSimilar}</p>
          )}
        </section>
      )}

      {(onPrev || onNext) && (
        <div className="flex gap-2">
          <button type="button" onClick={onPrev} disabled={!onPrev} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-v-md border border-line bg-surface px-3 text-small font-semibold text-ink disabled:opacity-50">
            <ChevronLeft size={18} aria-hidden="true" />{t.prevApt}
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-v-md border border-line bg-surface px-3 text-small font-semibold text-ink disabled:opacity-50">
            {t.nextApt}<ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
