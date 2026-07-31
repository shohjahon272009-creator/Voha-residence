import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ApartmentSearch from '@/components/website/ApartmentSearch';
import ApartmentAvailability from '@/components/website/ApartmentAvailability';
import { Locale } from '@/lib/dictionaries';
import { getApartments, getProjects } from '@/lib/actions';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';

  // SECURITY: strip real prices before apartment data reaches the client bundle.
  const apartments = getApartments().map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));
  const projects = getProjects();

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <div className="pt-24 min-h-screen">
        <ApartmentSearch apartments={apartments} projects={projects} lang={localeLang} />
        {settings.show_apartments !== 'false' && <ApartmentAvailability lang={localeLang} />}
      </div>
    </WebsiteLayout>
  );
}
