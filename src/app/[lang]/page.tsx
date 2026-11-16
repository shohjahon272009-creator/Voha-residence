 
 
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Hero from '@/components/website/Hero';
import { getPublicProjects, getApartments } from '@/lib/actions';
import ProjectsList from '@/components/website/ProjectsList';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import ComplexFacts from '@/components/website/ComplexFacts';
import ContactSection from '@/components/website/ContactSection';
import { Locale, getDictionary } from '@/lib/dictionaries';
import BuildStory from '@/components/website/BuildStory';
import PaymentPlan from '@/components/website/PaymentPlan';
import { standardMonthly } from '@/lib/paymentCalc';
import { pickerHref } from '@/lib/contacts';
import { buildModel } from '@/components/website/picker/data';

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

  const settings = await getPublicSettings();
  const companyName = settings.company_name || 'Voha Residence';

  const allProjects = await getPublicProjects();
  const selling = allProjects.filter((p) => p.status !== 'Topshirilgan' && !p.is_sold_out);
  // Hero rasmi: avval sotuvdagi bloklar (xaridor aynan shuni ko'rsin), keyin qolganlari
  const heroSlides = [...selling, ...allProjects.filter((p) => !selling.includes(p))]
    .filter((p) => Boolean(p.main_image))
    .slice(0, 8)
    .map((p) => ({ image: p.main_image as string, name: p.name_uz, id: p.id, city: p.city || '' }));

  // Xonadon brauzeri uchun — narxlar mijozga yuborilmaydi (xavfsizlik)
  const browserApartments = (await getApartments()).map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

  // Hero paneli: sotuvdagi bloklar va ulardagi bo'sh xonadonlar — tanlovchi bilan bir xil hisob
  // (bir manba: buildModel; takroriy yozuvlar bir marta sanaladi)
  const availability = buildModel(allProjects, browserApartments).blocks.map((b) => ({
    id: b.id,
    name: (localeLang === 'ru' ? b.project.name_ru : localeLang === 'en' ? b.project.name_en : b.project.name_uz) || b.project.name_uz,
    free: b.counts.available,
  }));
  const ctaHref = pickerHref(localeLang, settings);
  const monthlyFrom = `${standardMonthly(1, settings) / 1_000_000} mln`; // eng kichik — 1 xonali

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <Hero lang={localeLang} heroTitle={settings.hero_title} heroDesc={settings.hero_desc} slides={heroSlides} availability={availability} phone={settings.contact_phone || undefined} ctaHref={ctaHref} tour={{ href: `/${localeLang}/3d`, label: getDictionary(localeLang).tour3d.view3d }} />
      {/* Landingning asosiy bloki: xonadon tanlash (to'lov xonadon detalida) */}
      <ApartmentAndPayment
        apartments={browserApartments}
        projects={allProjects}
        lang={localeLang}
        showSearch={settings.show_search !== 'false'}
        showMortgage={settings.show_mortgage !== 'false'}
      />
      <ComplexFacts
        lang={localeLang}
        total={allProjects.length}
        done={allProjects.filter((p) => p.status === 'Topshirilgan').length}
        selling={availability.filter((a) => a.free > 0).length}
        monthlyFrom={monthlyFrom}
      />
      <PaymentPlan lang={localeLang} settings={settings} ctaHref={ctaHref} />
      <BuildStory lang={localeLang} />
      {settings.show_projects !== 'false' && <ProjectsList lang={localeLang} companyName={companyName} limit={6} />}
      {settings.show_contact !== 'false' && (
        <ContactSection lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} />
      )}
    </WebsiteLayout>
  );
}
