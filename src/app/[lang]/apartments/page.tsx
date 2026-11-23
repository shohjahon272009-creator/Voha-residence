import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import PageHero from '@/components/website/PageHero';
import HomeQuest from '@/components/website/HomeQuest';
import BuySteps from '@/components/website/BuySteps';
import { getPublicProjects, getApartments } from '@/lib/actions';
import { Locale } from '@/lib/dictionaries';
import { getPublicSettings } from '@/lib/settings';
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

  const settings = await getPublicSettings();
  const companyName = settings.company_name || 'Voha Residence';

  const allProjects = await getPublicProjects();
  const selling = allProjects.filter((p) => p.status !== 'Topshirilgan' && !p.is_sold_out);
  // Xonadon tanlovchi uchun — faqat sotuvdagi bloklar va faqat kerakli maydonlar.
  // Narx, izoh va topshirilgan bloklar xonadonlari brauzerga umuman yuborilmaydi.
  const sellingIds = new Set(selling.map((p) => p.id));
  const browserApartments = (await getApartments())
    .filter((a) => sellingIds.has(a.project_id))
    .map((a) => ({ id: a.id, project_id: a.project_id, floor: a.floor, number: a.number, rooms: a.rooms, area: a.area, status: a.status, plan_image: a.plan_image, image: a.image, price_cash: 0, price_installment: 0, orientation: '', note: '' }));

  const t = {
    uz: { kicker: 'Xonadonlar', title: 'Xonadoningizni tanlang', sub: "Blok, qavat va xonalar soni böyiça qidiring — tölovni darhol hisoblang." },
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
        />
      </div>
      <HomeQuest lang={localeLang} />
      <BuySteps lang={localeLang} />
    </WebsiteLayout>
  );
}
