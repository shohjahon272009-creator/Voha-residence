'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

// Server va hydration paytida false, JavaScript to'liq ishga tushgach true.
// Formalar JS yuklanmasdan yuborilib, ma'lumot yo'qolmasligi uchun (yoki URL'ga tushmasligi uchun).
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
