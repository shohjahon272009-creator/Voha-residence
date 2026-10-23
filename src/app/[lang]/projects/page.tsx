import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ProjectsList from '@/components/website/ProjectsList';
import PageHero from '@/components/website/PageHero';
import BuySteps from '@/components/website/BuySteps';
import { Locale } from '@/lib/dictionaries';
import { getPublicProjects } from '@/lib/actions';
import { getPublicSettings } from '@/lib/settings';
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

  const settings = await getPublicSettings();
  const companyName = settings.company_name || 'Voha Residence';

  // Banner slideri uchun loyiha rasmlari
  const bannerImages = (await getPublicProjects())
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
      <BuySteps lang={localeLang} />
    </WebsiteLayout>
  );
}
