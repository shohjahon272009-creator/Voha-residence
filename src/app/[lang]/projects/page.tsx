import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ProjectsList from '@/components/website/ProjectsList';
import SliderBanner from '@/components/website/SliderBanner';
import { Locale } from '@/lib/dictionaries';
import { getProjects } from '@/lib/actions';
import db from '@/lib/db';

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
    uz: { title: 'Bizning loyihalarimiz', tag: 'LOYIHALAR' },
    ru: { title: 'Наши проекты', tag: 'ПРОЕКТЫ' },
    en: { title: 'Our Projects', tag: 'PROJECTS' },
  }[localeLang] || { title: 'Bizning loyihalarimiz', tag: 'LOYIHALAR' };

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <SliderBanner images={bannerImages} title={t.title} subtitle={t.tag} />
      <div className="bg-brand-mesh">
        <ProjectsList lang={localeLang} companyName={companyName} />
      </div>
    </WebsiteLayout>
  );
}
