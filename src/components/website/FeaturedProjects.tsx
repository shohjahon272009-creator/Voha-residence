/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';
import { responsive } from '@/lib/responsiveImg';
import type { BlockModel } from './picker/data';

/*
  Sotuvdagi bloklar — yirik rasm va bazadan olingan faktlar (qavat, bo'sh xonadon, xona va maydon oralig'i).
  Birinchi uchta blok navbatma-navbat chap/o'ng joylashadi, qolganlari ixcham ro'yxatda.
  Narx yo'q; raqamlarning hammasi xonadonlar jadvalidan hisoblanadi.
*/

const T = {
  uz: { kicker: 'Sotuvdagi bloklar', title: 'Har blok — öz qiyofasi bilan', all: 'Barça loyihalar', floors: 'Qavatlar', free: 'Böş xonadonlar', rooms: 'Xonalar', area: 'Maydon', choose: 'Xonadonlarni köriş', about: 'Loyiha haqida', more: 'Yana sotuvda', freeN: (n: number) => `${n} ta böş`, m2: 'm²', roomsR: (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`) },
  ru: { kicker: 'Блоки в продаже', title: 'У каждого блока свой облик', all: 'Все проекты', floors: 'Этажей', free: 'Свободных квартир', rooms: 'Комнат', area: 'Площадь', choose: 'Смотреть квартиры', about: 'О проекте', more: 'Также в продаже', freeN: (n: number) => `${n} свободно`, m2: 'м²', roomsR: (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`) },
  en: { kicker: 'Blocks on sale', title: 'Every block has its own character', all: 'All projects', floors: 'Floors', free: 'Available apartments', rooms: 'Rooms', area: 'Area', choose: 'See apartments', about: 'About the project', more: 'Also on sale', freeN: (n: number) => `${n} available`, m2: 'm²', roomsR: (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`) },
};

const isGood = (src?: string | null) => Boolean(src) && !String(src).includes('nfull');

function facts(b: BlockModel) {
  const free = b.floors.flatMap((g) => g.apts).filter((a) => a.status === "Bo'sh" || a.status === ('Bo‘sh' as string));
  const rooms = free.map((a) => Number(a.rooms) || 0).filter(Boolean);
  const areas = free.map((a) => Number(a.area) || 0).filter(Boolean);
  return {
    free: b.counts.available,
    rooms: rooms.length ? [Math.min(...rooms), Math.max(...rooms)] as const : null,
    area: areas.length ? [Math.floor(Math.min(...areas)), Math.ceil(Math.max(...areas))] as const : null,
  };
}

export default function FeaturedProjects({ lang, blocks }: { lang: Locale; blocks: BlockModel[] }) {
  const t = T[lang as keyof typeof T] || T.uz;
  const name = (b: BlockModel) => (lang === 'ru' ? b.project.name_ru : lang === 'en' ? b.project.name_en : b.project.name_uz) || b.project.name_uz;
  // Yirik ko'rgazmaga: rasmi bor va bo'sh xonadoni bor bloklar
  const withFree = blocks.filter((b) => b.counts.available > 0);
  const featured = withFree.filter((b) => isGood(b.project.main_image)).slice(0, 3);
  const rest = withFree.filter((b) => !featured.includes(b));
  if (!featured.length) return null;

  return (
    <section id="projects" className="bg-surface text-ink py-[var(--v-section-y)]">
      <div className="max-w-page mx-auto px-[var(--v-gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-small font-semibold text-accent-text">{t.kicker}</p>
            <h2 className="mt-3 text-h1 font-montserrat max-w-[18ch]">{t.title}</h2>
          </div>
          <Link href={`/${lang}/projects`} className="inline-flex items-center gap-2 min-h-[44px] font-semibold text-accent-text underline underline-offset-4">
            {t.all} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-14 flex flex-col gap-20 lg:gap-28">
          {featured.map((b, i) => {
            const f = facts(b);
            const img = responsive(b.project.main_image, '(max-width: 1024px) 100vw, 58vw');
            const rows: [string, string][] = [[t.floors, String(b.maxFloor || '—')], [t.free, String(f.free)]];
            if (f.rooms) rows.push([t.rooms, t.roomsR(f.rooms[0], f.rooms[1])]);
            if (f.area) rows.push([t.area, `${f.area[0]}–${f.area[1]} ${t.m2}`]);
            return (
              <article key={b.id} className="grid gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
                <div className={`lg:col-span-7 ${i % 2 ? 'lg:order-2' : ''}`}>
                  <div className="overflow-hidden rounded-v-lg bg-surface-sunken">
                    <img
                      src={img.src}
                      srcSet={img.srcSet?.split(', ').filter((x) => x.includes('/_w/')).join(', ')}
                      sizes={img.sizes}
                      alt={name(b)}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
                <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-1' : ''}`}>
                  <p className="text-small text-ink-muted tabular-nums">0{i + 1}</p>
                  <h3 className="mt-2 font-montserrat text-[clamp(2.25rem,5vw,4rem)] font-bold leading-none tracking-tight">{name(b)}</h3>
                  <dl className="mt-8 border-t border-line">
                    {rows.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                        <dt className="text-body text-ink-muted">{k}</dt>
                        <dd className="text-body-lg font-semibold tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={`/${lang}#xonadon=${b.id}`}
                      className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full bg-inverse text-ink-inverse font-bold transition duration-v-fast ease-v hover:brightness-110 active:scale-[0.98]"
                    >
                      {t.choose} <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <Link href={`/${lang}/projects/${b.id}`} className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4">
                      {t.about}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {rest.length > 0 && (
          <div className="mt-20 border-t border-line pt-8">
            <p className="text-small font-semibold text-ink-muted">{t.more}</p>
            <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((b) => (
                <li key={b.id} className="border-b border-line">
                  <Link href={`/${lang}#xonadon=${b.id}`} className="flex items-center justify-between gap-4 min-h-[56px] py-3 group">
                    <span className="text-h3 font-montserrat">{name(b)}</span>
                    <span className="flex items-center gap-3 text-body text-ink-muted">
                      {t.freeN(b.counts.available)}
                      <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-v-base ease-v group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
