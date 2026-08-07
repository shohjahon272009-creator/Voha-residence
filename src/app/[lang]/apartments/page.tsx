import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ApartmentAndPayment from '@/components/website/ApartmentAndPayment';
import { getProjects, getApartments } from '@/lib/actions';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';

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

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <div className="pt-24 md:pt-28 bg-brand-mesh min-h-screen">
        <ApartmentAndPayment
          apartments={browserApartments}
          projects={allProjects}
          lang={localeLang}
          showSearch
          showMortgage={settings.show_mortgage !== 'false'}
          terms={{
            down: Number(settings.calc_down) || 30,
            months: Number(settings.calc_months) || 12,
            rate: Number(settings.calc_rate) || 18,
            mDown: Number(settings.calc_m_down) || 15,
            mMonths: Number(settings.calc_m_months) || 24,
          }}
        />
      </div>
    </WebsiteLayout>
  );
}
