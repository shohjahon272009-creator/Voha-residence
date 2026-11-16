'use client';

// Umumiy kichik qismlar: holat belgisi, pastki oyna (bottom sheet), qurilma imkoniyati hook'lari.
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { StatusKind } from './data';
import type { Dict } from './i18n';

// ---- Holat: rang + matn + belgi ----
export const STATUS_ICON: Record<StatusKind, string> = { available: '●', reserved: '◐', sold: '✕' };
export const STATUS_CLS: Record<StatusKind, string> = {
  available: 'bg-st-available-bg text-st-available',
  reserved: 'bg-st-reserved-bg text-st-reserved',
  sold: 'bg-st-sold-bg text-st-sold',
};
export const statusText = (k: StatusKind, t: Dict) => (k === 'available' ? t.available : k === 'reserved' ? t.reserved : t.sold);

export function StatusBadge({ kind, t, className = '' }: { kind: StatusKind; t: Dict; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-small font-semibold ${STATUS_CLS[kind]} ${className}`}>
      <span aria-hidden="true">{STATUS_ICON[kind]}</span>
      {statusText(kind, t)}
    </span>
  );
}

// ---- Media query / qurilma imkoniyatlari (SSR'da false) ----
function subscribeMedia(q: string) {
  return (cb: () => void) => {
    const m = window.matchMedia(q);
    m.addEventListener('change', cb);
    return () => m.removeEventListener('change', cb);
  };
}
const subs = new Map<string, (cb: () => void) => () => void>();
export function useMedia(q: string): boolean {
  let s = subs.get(q);
  if (!s) { s = subscribeMedia(q); subs.set(q, s); }
  return useSyncExternalStore(s, () => window.matchMedia(q).matches, () => false);
}

let webglCache: boolean | null = null;
// WebGL bor-yo'qligini bir marta tekshiramiz va kontekstni darhol bo'shatamiz
export function webglSupported(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    webglCache = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noopSub = () => () => {};
export function useWebGL(enabled: boolean): boolean {
  return useSyncExternalStore(noopSub, () => (enabled ? webglSupported() : false), () => false);
}
export function useCores(): number {
  return useSyncExternalStore(noopSub, () => navigator.hardwareConcurrency || 0, () => 0);
}

// ---- Bottom sheet: Escape yopadi, fokus ichkariga, fon inert + scroll qulf ----
type SheetProps = { title: string; closeLabel: string; onClose: () => void; children: ReactNode; footer?: ReactNode };

export function Sheet({ title, closeLabel, onClose, children, footer }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const host = panelRef.current?.closest('[data-picker-sheet]') as HTMLElement | null;
    // Fondagi hamma narsani inert qilamiz
    const touched: HTMLElement[] = [];
    for (const el of Array.from(document.body.children) as HTMLElement[]) {
      if (el === host || el.hasAttribute('inert')) continue;
      el.setAttribute('inert', '');
      touched.push(el);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); } };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      touched.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      if (prev && prev.isConnected) prev.focus();
    };
  }, []);

  return createPortal(
    <div data-picker-sheet="" className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" onClick={() => closeRef.current()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-v-xl bg-surface text-ink shadow-v-md"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
          <h3 className="text-h3">{title}</h3>
          <button
            type="button"
            data-autofocus=""
            onClick={() => closeRef.current()}
            aria-label={closeLabel}
            className="grid h-11 w-11 place-items-center rounded-full bg-surface-sunken text-ink"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4" data-lenis-prevent="">{children}</div>
        {footer && <div className="border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
