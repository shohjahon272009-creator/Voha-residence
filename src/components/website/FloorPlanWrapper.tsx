 
 
 
 
 
'use client';

import React, { useState } from 'react';
import FloorPlan from './FloorPlan';
import BookingModal from './BookingModal';
import { Apartment } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';

export default function FloorPlanWrapper({
  apartments,
  lang,
}: {
  apartments: Apartment[];
  lang: Locale;
}) {
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);

  return (
    <>
      {selectedApt && (
        <BookingModal
          apartment={selectedApt}
          lang={lang}
          onClose={() => setSelectedApt(null)}
        />
      )}
      <FloorPlan
        apartments={apartments}
        lang={lang}
        onSelect={(apt) => setSelectedApt(apt)}
      />
    </>
  );
}
