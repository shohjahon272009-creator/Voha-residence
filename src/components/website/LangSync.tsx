'use client';

import { useEffect } from 'react';

// Sayt ichida til almashtirilganda (uz -> ru) root layout qayta chizilmaydi —
// <html lang> ni klientda ham yangilab turamiz.
export default function LangSync({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
