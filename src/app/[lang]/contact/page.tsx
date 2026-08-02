import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import ContactSection from '@/components/website/ContactSection';
import { Locale } from '@/lib/dictionaries';
import db from '@/lib/db';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Voha Residence';

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <div className="pt-28 min-h-screen bg-[#FDFBF7]">
        <ContactSection lang={localeLang}  />
      </div>
    </WebsiteLayout>
  );
}
