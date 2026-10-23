 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Hero from '@/components/website/Hero';
import { getPublicProjects, getApartments } from '@/lib/actions';
import ProjectsList from '@/components/website/ProjectsList';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import AboutSection from '@/components/website/AboutSection';
import NewsSection from '@/components/website/NewsSection';
import LocationShowcase from '@/components/website/LocationShowcase';
import ContactSection from '@/components/website/ContactSection';
import { Locale, getDictionary } from '@/lib/dictionaries';
import AnimatedReveal from '@/components/website/AnimatedReveal';
import CinemaScroll from '@/components/website/CinemaScroll';
import BuildStory from '@/components/website/BuildStory';
import HomeQuest from '@/components/website/HomeQuest';
import BuySteps from '@/components/website/BuySteps';
import VelocityMarquee from '@/components/website/VelocityMarquee';
import { PaymentTerms, Timeline, Testimonials, SocialStrip } from '@/components/website/VohaStory';
import VohaLogo from '@/components/common/VohaLogo';

import db from '@/lib/db';
import { getPublicSettings } from '@/lib/settings';
import type { Metadata } from 'next';
import { pageMetadata, PAGE_SEO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const texts = { ...PAGE_SEO.home };
  try {
    const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('meta_title_uz', 'meta_description')").all() as { key: string; value: string }[];
    const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    texts.uz = { title: s.meta_title_uz || texts.uz.title, description: s.meta_description || texts.uz.description };
  } catch { /* standart matn */ }
  return pageMetadata(lang, '', texts);
}

// Doim yangi ma'lumot — admin o'zgartirsa darhol ko'rinadi (statik keshlanmaydi)
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;
  const dict = getDictionary(localeLang);

  const settings = await getPublicSettings();
  const companyName = settings.company_name || 'Qurilish';

  // Bosh sahifa slideri uchun loyiha rasmlari (eng yangi loyihalar oldinda)
  const allProjects = await getPublicProjects();
  const heroImages = allProjects
    .map((p) => p.main_image)
    .filter((img): img is string => Boolean(img))
    .slice(0, 8);

  // Hero slider uchun to'liq ma'lumot (rasm + loyiha nomi + shahar + havola)
  const heroSlides = allProjects
    .filter((p) => Boolean(p.main_image))
    .slice(0, 8)
    .map((p) => ({ image: p.main_image as string, name: p.name_uz, id: p.id, city: p.city || '' }));

  // Xonadon brauzeri uchun — narxlar mijozga yuborilmaydi (xavfsizlik)
  const browserApartments = (await getApartments()).map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <Hero lang={localeLang} companyName={companyName} heroTitle={settings.hero_title} heroDesc={settings.hero_desc} images={heroImages} slides={heroSlides} settings={settings} />
      {settings.show_cinema !== 'false' && <CinemaScroll lang={localeLang} />}
      {settings.show_projects !== 'false' && (
        <AnimatedReveal>
          <ProjectsList lang={localeLang} companyName={companyName} limit={6} />
        </AnimatedReveal>
      )}
      <BuildStory lang={localeLang} />
      <PaymentTerms lang={localeLang} />
      <AnimatedReveal>
        <ApartmentAndPayment
          apartments={browserApartments}
          projects={allProjects}
          lang={localeLang}
          showSearch={settings.show_search !== 'false'}
          showMortgage={settings.show_mortgage !== 'false'}
          showLocations={settings.show_locations !== 'false'}
          terms={{
            down: Number(settings.calc_down) || 30,
            months: Number(settings.calc_months) || 12,
            rate: Number(settings.calc_rate) || 18,
            mDown: Number(settings.calc_m_down) || 15,
            mMonths: Number(settings.calc_m_months) || 24,
          }}
        />
      </AnimatedReveal>
      <VelocityMarquee words={['Voha Residence', '0% foiz', 'Urganch', 'Kadastr tayyor', 'Xorazm']} />

      {/* About Section */}
      {settings.show_about !== 'false' && (
        <AnimatedReveal>
          <AboutSection lang={localeLang} settings={settings} />
        </AnimatedReveal>
      )}
      <Timeline lang={localeLang} />
      <Testimonials lang={localeLang} />

      {settings.show_news !== 'false' && (
        <AnimatedReveal>
          <NewsSection lang={localeLang} />
        </AnimatedReveal>
      )}
      {settings.show_offices !== 'false' && (
        <AnimatedReveal>
          <LocationShowcase lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} />
        </AnimatedReveal>
      )}
      <SocialStrip lang={localeLang} />
      <BuySteps lang={localeLang} />
      <HomeQuest lang={localeLang} />
      {settings.show_contact !== 'false' && (
        <AnimatedReveal>
          <ContactSection lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} />
        </AnimatedReveal>
      )}
    </WebsiteLayout>
  );
}
