import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ContactSection from '@/components/website/ContactSection';
import PageHero from '@/components/website/PageHero';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';
import type { Metadata } from 'next';
import { pageMetadata, PAGE_SEO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, '/contact', PAGE_SEO.contact);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';

  const t = {
    uz: { kicker: 'Aloqa', title: "Biz bilan bog'laning", sub: "Savolingiz bormi? Qo'ng'iroq qiling yoki xabar qoldiring — tez orada javob beramiz." },
    ru: { kicker: 'Контакты', title: 'Свяжитесь с нами', sub: 'Есть вопросы? Позвоните или оставьте сообщение — мы быстро ответим.' },
    en: { kicker: 'Contact', title: 'Get in touch', sub: "Questions? Call us or leave a message — we'll reply shortly." },
  }[localeLang] || { kicker: 'Aloqa', title: "Biz bilan bog'laning", sub: '' };

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <PageHero lang={localeLang} kicker={t.kicker} title={t.title} subtitle={t.sub} images={['/cinema/stills/life-2.jpg']} />
      <div className="min-h-screen bg-[#FDFBF7]">
        <ContactSection lang={localeLang}  />
      </div>
    </WebsiteLayout>
  );
}
