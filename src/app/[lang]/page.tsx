 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Hero from '@/components/website/Hero';
import { getProjects, getApartments } from '@/lib/actions';
import ProjectsList from '@/components/website/ProjectsList';
import ApartmentBrowser from '@/components/website/ApartmentBrowser';
import AboutSection from '@/components/website/AboutSection';
import MortgageCalculator from '@/components/website/MortgageCalculator';
import NewsSection from '@/components/website/NewsSection';
import SalesOfficesSection from '@/components/website/SalesOfficesSection';
import ContactSection from '@/components/website/ContactSection';
import { Locale, getDictionary } from '@/lib/dictionaries';
import AnimatedReveal from '@/components/website/AnimatedReveal';
import VohaLogo from '@/components/common/VohaLogo';

import db from '@/lib/db';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;
  const dict = getDictionary(localeLang);

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Qurilish';

  // Bosh sahifa slideri uchun loyiha rasmlari (eng yangi loyihalar oldinda)
  const allProjects = await getProjects();
  const heroImages = allProjects
    .map((p) => p.main_image)
    .filter((img): img is string => Boolean(img))
    .slice(0, 8);

  // Xonadon brauzeri uchun — narxlar mijozga yuborilmaydi (xavfsizlik)
  const browserApartments = (await getApartments()).map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <Hero lang={localeLang} companyName={companyName} heroTitle={settings.hero_title} heroDesc={settings.hero_desc} images={heroImages} />
      {settings.show_projects !== 'false' && <ProjectsList lang={localeLang} companyName={companyName} limit={6} />}
      {settings.show_search !== 'false' && <ApartmentBrowser apartments={browserApartments} projects={allProjects} lang={localeLang} />}
      {settings.show_mortgage !== 'false' && <MortgageCalculator lang={localeLang} />}
      
      {/* About Section */}
      {settings.show_about !== 'false' && <AboutSection lang={localeLang} settings={settings} />}

      {settings.show_news !== 'false' && <NewsSection lang={localeLang} />}
      <SalesOfficesSection lang={localeLang} />
      {settings.show_contact !== 'false' && <ContactSection lang={localeLang} />}
    </WebsiteLayout>
  );
}
