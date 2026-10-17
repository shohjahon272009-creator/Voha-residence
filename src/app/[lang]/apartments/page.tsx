import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import PageHero from '@/components/website/PageHero';
import HomeQuest from '@/components/website/HomeQuest';
import BuySteps from '@/components/website/BuySteps';
import { getProjects, getApartments } from '@/lib/actions';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';
import type { Metadata } from 'next';
import { pageMetadata, PAGE_SEO } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, '/apartments', PAGE_SEO.apartments);
}

export const dynamic = 'force-dynamic';

// Alohida "Xonadonlar" sahifasi — barcha xonadonlarni qidirish + to'lov kalkulyatori.
export default async function ApartmentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = await db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';

  const allProjects = await getProjects();
  // Narxlar mijozga yuborilmaydi (xavfsizlik) — faqat serverda hisoblanadi
  const browserApartments = (await getApartments()).map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

  const t = {
    uz: { kicker: 'Xonadonlar', title: 'Xonadoningizni tanlang', sub: "Blok, qavat va xonalar soni bo'yicha qidiring — to'lovni darhol hisoblang." },
    ru: { kicker: 'Квартиры', title: 'Выберите свою квартиру', sub: 'Ищите по блоку, этажу и числу комнат — платёж рассчитывается сразу.' },
    en: { kicker: 'Apartments', title: 'Choose your apartment', sub: 'Search by block, floor and rooms — see your payment instantly.' },
  }[localeLang] || { kicker: 'Xonadonlar', title: 'Xonadoningizni tanlang', sub: '' };

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <PageHero lang={localeLang} kicker={t.kicker} title={t.title} subtitle={t.sub} images={['/cinema/stills/life-3.webp', '/cinema/stills/plan-1.webp']} />
      <div className="bg-brand-mesh min-h-screen">
        <ApartmentAndPayment
          apartments={browserApartments}
          projects={allProjects}
          lang={localeLang}
          showSearch
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
      </div>
      <HomeQuest lang={localeLang} />
      <BuySteps lang={localeLang} />
    </WebsiteLayout>
  );
}
