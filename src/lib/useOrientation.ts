'use client';

import { useSyncExternalStore } from 'react';

// Ekran yo'nalishi (portret/gorizontal) — burilganda yangilanadi. SSR'da null (hali noma'lum).
const portraitMq = () => window.matchMedia('(orientation: portrait)');
const subscribe = (cb: () => void) => {
  const mq = portraitMq();
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

export function usePortrait(): boolean | null {
  return useSyncExternalStore(subscribe, () => portraitMq().matches, () => null);
}
