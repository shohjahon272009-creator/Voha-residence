 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Hero from '@/components/website/Hero';
import { getProjects, getApartments } from '@/lib/actions';
import ProjectsList from '@/components/website/ProjectsList';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import AboutSection from '@/components/website/AboutSection';
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
      {settings.show_projects !== 'false' && (
        <AnimatedReveal>
          <ProjectsList lang={localeLang} companyName={companyName} limit={6} />
        </AnimatedReveal>
      )}
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

      {/* About Section */}
      {settings.show_about !== 'false' && (
        <AnimatedReveal>
          <AboutSection lang={localeLang} settings={settings} />
        </AnimatedReveal>
      )}

      {settings.show_news !== 'false' && (
        <AnimatedReveal>
          <NewsSection lang={localeLang} />
        </AnimatedReveal>
      )}
      {settings.show_offices !== 'false' && (
        <AnimatedReveal>
          <SalesOfficesSection lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} officeLat={settings.office_lat} officeLng={settings.office_lng} />
        </AnimatedReveal>
      )}
      {settings.show_contact !== 'false' && (
        <AnimatedReveal>
          <ContactSection lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} />
        </AnimatedReveal>
      )}
    </WebsiteLayout>
  );
}
