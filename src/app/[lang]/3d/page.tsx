import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { pageMetadata } from '@/lib/seo';
import VohaLogo from '@/components/common/VohaLogo';
import Scene3DLoader from '@/components/website/Scene3DLoader';

/*
  Mavze 3D turi: to'liq ekranli sahna (WebsiteLayout'siz — Lenis silliq scroll va footer bu yerda
  kerak emas, sahna g'ildirak/sensor hodisalarini o'zi boshqaradi).
  ?project=<id> — kirish animatsiyasidan keyin o'sha loyiha bloki ochiladi.
*/
export const dynamic = 'force-dynamic';

const SEO = {
  uz: { title: 'Mavze 3D turi — Voha Residence', description: "Voha Residence mavzesini 3D'da aylantirib köring: blokni bosing, qavatlar va böş xonadonlarni köring, körişga yoziling." },
  ru: { title: '3D-тур по комплексу — Voha Residence', description: 'Осмотрите комплекс Voha Residence в 3D: нажмите на блок, посмотрите этажи и свободные квартиры, запишитесь на просмотр.' },
  en: { title: 'Complex 3D tour — Voha Residence', description: 'Explore the Voha Residence complex in 3D: tap a block to see floors and available apartments, and book a viewing.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, '/3d', SEO);
}

const LANGS: Locale[] = ['uz', 'ru', 'en'];

export default async function Tour3DPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Locale;
  const { project } = await searchParams;
  const initialProject = Number.parseInt(project || '', 10);
  const t = getDictionary(lang).tour3d;

  return (
    <main className="fixed inset-0 bg-[#dfe9e6] overflow-hidden">
      <Scene3DLoader lang={lang} initialProject={Number.isInteger(initialProject) ? initialProject : undefined} />

      <header className="absolute top-0 inset-x-0 z-[45] flex items-center justify-between gap-3 px-3 md:px-5 py-3 pointer-events-none">
        <Link
          href={`/${lang}`}
          aria-label={t.home}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-white/95 pl-3 pr-4 py-2 shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} className="text-primary" />
          <VohaLogo className="h-7 w-auto" isScrolled />
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <h1 className="hidden sm:flex items-center gap-2 rounded-full bg-primary/90 text-white text-xs font-bold px-4 py-2.5 shadow-lg">
            {t.title}
            <span className="rounded-full bg-accent text-primary px-2 py-0.5 text-[10px] uppercase tracking-wide">{t.concept}</span>
          </h1>
          <nav aria-label="Til" className="flex rounded-full bg-white/95 p-1 shadow-lg text-[11px] font-bold uppercase">
            {LANGS.map((l) => (
              <Link
                key={l}
                href={`/${l}/3d`}
                className={`px-2.5 py-1.5 rounded-full transition-colors ${l === lang ? 'bg-primary text-white' : 'text-primary/60 hover:text-primary'}`}
              >
                {l}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </main>
  );
}
