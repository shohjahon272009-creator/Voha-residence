import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ProjectsList from '@/components/website/ProjectsList';
import PageHero from '@/components/website/PageHero';
import { Locale } from '@/lib/dictionaries';
import { getProjects } from '@/lib/actions';
import db from '@/lib/db';
import type { Metadata } from 'next';
import { pageMetadata, PAGE_SEO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, '/projects', PAGE_SEO.projects);
}

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';

  // Banner slideri uchun loyiha rasmlari
  const bannerImages = (await getProjects())
    .map((p) => p.main_image)
    .filter((img): img is string => Boolean(img))
    .slice(0, 8);

  const t = {
    uz: { title: 'Bizning loyihalarimiz', tag: 'Loyihalar', sub: "Urganch va Xorazm bo'ylab zamonaviy turar-joy majmualari — har biri o'z hikoyasi bilan." },
    ru: { title: 'Наши проекты', tag: 'Проекты', sub: 'Современные жилые комплексы по Ургенчу и Хорезму — у каждого своя история.' },
    en: { title: 'Our Projects', tag: 'Projects', sub: 'Modern residential complexes across Urgench and Khorezm — each with its own story.' },
  }[localeLang] || { title: 'Bizning loyihalarimiz', tag: 'Loyihalar', sub: '' };

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <PageHero lang={localeLang} kicker={t.tag} title={t.title} subtitle={t.sub} images={bannerImages} />
      <div className="bg-brand-mesh">
        <ProjectsList lang={localeLang} companyName={companyName} />
      </div>
    </WebsiteLayout>
  );
}
