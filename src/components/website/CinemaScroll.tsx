'use client';

import { Locale } from '@/lib/dictionaries';

/*
  Avvalgi uzun kino-scroll (380–440vh, /cinema/frames* kadrlari) olib tashlandi:
  mehmon vaqti scroll'ga ketardi. Video endi BuildStory ichidagi kichik "loyiha" kartasida
  (showcase/ProjectVideoCard.tsx). Komponent page.tsx buzilmasligi uchun saqlangan va hech narsa chizmaydi.
*/
export default function CinemaScroll({ lang }: { lang: Locale }) {
  void lang;
  return null;
}
