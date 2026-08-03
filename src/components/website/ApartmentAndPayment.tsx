'use client';

import React, { useState } from 'react';
import ApartmentBrowser from './ApartmentBrowser';
import MortgageCalculator from './MortgageCalculator';
import { Apartment, Project, SelectedApartment } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';

// Xonadon tanlash + to'lov kalkulyatorini bitta holatga bog'laydi:
// mijoz xonadonni tanlagach, uning to'lovi (serverda hisoblanadi) kalkulyatorda chiqadi.
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
  const [selected, setSelected] = useState<SelectedApartment | null>(null);

  return (
    <>
      {showSearch && (
        <ApartmentBrowser apartments={apartments} projects={projects} lang={lang} onSelect={setSelected} />
      )}
      {showMortgage && (
        <MortgageCalculator lang={lang} selected={selected} onClearSelected={() => setSelected(null)} />
      )}
    </>
  );
}
