'use client';

import React, { useCallback, useState } from 'react';
import ComplexPicker from './picker/ComplexPicker';
import AptPayment from './picker/AptPayment';
import BookingModal from './BookingModal';
import { Apartment, Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';

// Xonadon tanlash (majmua → blok → qavat → xonadon) + shu xonadon bo'yicha murojaat oynasi.
// To'lov (serverda hisoblanadi) xonadon detalining o'zida ko'rinadi.
export default function ApartmentAndPayment({
  apartments,
  projects,
  lang,
  showSearch,
  showMortgage,
}: {
  apartments: Apartment[];
  projects: Project[];
  lang: Locale;
  showSearch: boolean;
  showMortgage: boolean;
}) {
  const [request, setRequest] = useState<Apartment | null>(null);
  const pickerLang = lang === 'ru' || lang === 'en' ? lang : 'uz';
  const renderPayment = useCallback((apt: Apartment) => <AptPayment aptId={apt.id} lang={pickerLang} />, [pickerLang]);

  if (!showSearch) return null;
  return (
    <div id="xonadon-tanlash">
      <ComplexPicker
        lang={pickerLang}
        projects={projects}
        apartments={apartments}
        onRequest={setRequest}
        renderPayment={showMortgage ? renderPayment : undefined}
        suspendSheet={!!request}
      />
      {request && <BookingModal lang={lang} apartment={request} onClose={() => setRequest(null)} />}
    </div>
  );
}
