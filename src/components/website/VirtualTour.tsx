'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';
import { TourScene } from '@/lib/types';

const labels: Record<Locale, { pin: string; title: string; loading: string; newTab: string; hint: string; hintTour: string }> = {
  uz: { pin: "360° Virtual sayohat", title: "360° Virtual sayohat", loading: "Yuklanmoqda…", newTab: "Yangi oynada ochish", hint: "Atrofga qarash uchun sichqoncha bilan suring", hintTour: "Belgilarni bosib boshqa nuqtalarga o'ting" },
  ru: { pin: "360° Виртуальный тур", title: "360° Виртуальный тур", loading: "Загрузка…", newTab: "Открыть в новом окне", hint: "Перетаскивайте мышью, чтобы осмотреться", hintTour: "Нажимайте на метки для перехода" },
  en: { pin: "360° Virtual Tour", title: "360° Virtual Tour", loading: "Loading…", newTab: "Open in new tab", hint: "Drag with your mouse to look around", hintTour: "Click the markers to move between points" },
};

function isPanoramaImage(url: string): boolean {
  return /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(url);
}

// Inject one small stylesheet that turns Pannellum scene-hotspots into glowing pins.
function ensureHotspotStyle() {
  if (document.getElementById('tour-hotspot-style')) return;
  const style = document.createElement('style');
  style.id = 'tour-hotspot-style';
  style.textContent = `
    .tour-hotspot{width:40px;height:40px;margin-left:-20px;margin-top:-20px;border-radius:50%;
      background:radial-gradient(circle at 50% 38%,#e6a86e,#c47e4d);border:3px solid #fff;cursor:pointer;
      box-shadow:0 6px 18px rgba(0,0,0,.5);animation:tourPulse 2s infinite;transition:transform .2s}
    .tour-hotspot:hover{transform:scale(1.15)}
    .tour-hotspot::after{content:'';position:absolute;left:50%;top:50%;width:12px;height:12px;
      transform:translate(-50%,-50%);border-radius:50%;background:#fff}
    @keyframes tourPulse{0%,100%{box-shadow:0 0 0 0 rgba(209,142,91,.55)}70%{box-shadow:0 0 0 18px rgba(209,142,91,0)}}
  `;
  document.head.appendChild(style);
}

function loadPannellum(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const w = window as unknown as { pannellum?: unknown };
  ensureHotspotStyle();
  if (w.pannellum) return Promise.resolve(w.pannellum);

  if (!document.getElementById('pannellum-css')) {
    const link = document.createElement('link');
    link.id = 'pannellum-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('pannellum-js') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(w.pannellum));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'pannellum-js';
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => resolve(w.pannellum);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function VirtualTour({
  url,
  lang,
  projectName,
  tourScenes,
}: {
  url?: string;
  lang: Locale;
  projectName: string;
  tourScenes?: TourScene[];
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const t = labels[lang] || labels.uz;

  const hasTour = Array.isArray(tourScenes) && tourScenes.length > 0;
  const singleUrl = url || '';
  const isImage = !hasTour && isPanoramaImage(singleUrl);
  const usePannellum = hasTour || isImage;

  const panoRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Initialise Pannellum for uploaded panorama(s)
  useEffect(() => {
    if (!open || !usePannellum) return;
    let cancelled = false;

    loadPannellum()
      .then((pannellum: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (cancelled || !panoRef.current) return;

        let config: Record<string, unknown>;
        if (hasTour) {
          // Multi-scene tour with clickable hotspots that teleport between scenes
          const scenes: Record<string, unknown> = {};
          for (const s of tourScenes!) {
            scenes[s.id] = {
              type: 'equirectangular',
              panorama: s.image,
              autoLoad: true,
              hfov: 110,
              hotSpots: (s.hotspots || []).map((h) => ({
                pitch: h.pitch,
                yaw: h.yaw,
                type: 'scene',
                sceneId: h.target,
                text: h.label || '',
                cssClass: 'tour-hotspot',
              })),
            };
          }
          config = {
            default: { firstScene: tourScenes![0].id, autoLoad: true, sceneFadeDuration: 700 },
            scenes,
          };
        } else {
          config = {
            type: 'equirectangular',
            panorama: singleUrl,
            autoLoad: true,
            autoRotate: -2,
            showZoomCtrl: true,
            showFullscreenCtrl: false,
            compass: false,
            hfov: 110,
          };
        }

        viewerRef.current = pannellum.viewer(panoRef.current, config);
        viewerRef.current.on('load', () => { if (!cancelled) setLoaded(true); });
      })
      .catch(() => { if (!cancelled) setLoaded(true); });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch { /* noop */ }
        viewerRef.current = null;
      }
      setLoaded(false);
    };
  }, [open, usePannellum, hasTour, singleUrl, tourScenes]);

  // Nothing to show
  if (!hasTour && !singleUrl) return null;

  return (
    <>
      {/* Clickable pin marker overlaid on the hero image */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t.pin}
        className="group absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center focus:outline-none"
      >
        <span className="relative flex flex-col items-center">
          <span className="absolute top-0 w-16 h-16 rounded-full bg-accent/40 animate-ping" />
          <span className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent to-[#c47e4d] ring-4 ring-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
            <Camera className="w-7 h-7" />
          </span>
          <span className="w-5 h-5 -mt-2 rotate-45 bg-[#c47e4d] ring-4 ring-white shadow-lg" />
        </span>
        <span className="mt-3 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur text-primary text-xs font-bold shadow-lg whitespace-nowrap transition-all duration-300 group-hover:bg-accent group-hover:text-white">
          {t.pin}
        </span>
      </button>

      {/* Fullscreen tour modal */}
      {open && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0">
            <div className="flex items-center gap-3 text-white min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">{projectName}</div>
                <div className="text-white/50 text-xs">{t.title}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!hasTour && singleUrl && (
                <a
                  href={singleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> {t.newTab}
                </a>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative px-2 pb-2 md:px-4 md:pb-4">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-white/10">
              {!loaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-white/70 pointer-events-none">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <span className="text-sm font-bold">{t.loading}</span>
                </div>
              )}

              {usePannellum ? (
                <div ref={panoRef} className="absolute inset-0 w-full h-full" />
              ) : (
                <iframe
                  src={singleUrl}
                  title={`${projectName} — ${t.title}`}
                  className={`w-full h-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ border: 0 }}
                  allow="accelerometer; gyroscope; xr-spatial-tracking; fullscreen; vr"
                  allowFullScreen
                  onLoad={() => setLoaded(true)}
                />
              )}

              <div className="absolute left-3 bottom-3 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white/80 text-xs font-medium pointer-events-none">
                <Maximize2 className="w-3.5 h-3.5" /> {hasTour ? t.hintTour : t.hint}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
