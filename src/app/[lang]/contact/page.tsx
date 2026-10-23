import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ContactSection from '@/components/website/ContactSection';
import LocationShowcase from '@/components/website/LocationShowcase';
import PageHero from '@/components/website/PageHero';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';
import { getPublicSettings } from '@/lib/settings';
import type { Metadata } from 'next';
import { pageMetadata, PAGE_SEO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, '/contact', PAGE_SEO.contact);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settings = await getPublicSettings();
  const companyName = settings.company_name || 'Voha Residence';

  const t = {
    uz: { kicker: 'Aloqa', title: "Biz bilan bog'laning", sub: "Savolingiz bormi? Qo'ng'iroq qiling yoki xabar qoldiring — tez orada javob beramiz." },
    ru: { kicker: 'Контакты', title: 'Свяжитесь с нами', sub: 'Есть вопросы? Позвоните или оставьте сообщение — мы быстро ответим.' },
    en: { kicker: 'Contact', title: 'Get in touch', sub: "Questions? Call us or leave a message — we'll reply shortly." },
  }[localeLang] || { kicker: 'Aloqa', title: "Biz bilan bog'laning", sub: '' };

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <PageHero lang={localeLang} kicker={t.kicker} title={t.title} subtitle={t.sub} images={['/cinema/stills/life-2.webp']} />
      <div className="min-h-screen bg-[#FDFBF7]">
        <ContactSection lang={localeLang}  />
        <LocationShowcase lang={localeLang} phone={settings.contact_phone} address={settings.contact_address} hours={settings.contact_hours} />
      </div>
    </WebsiteLayout>
  );
}
