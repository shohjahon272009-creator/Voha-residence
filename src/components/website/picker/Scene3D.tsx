'use client';

// Konsept 3D ko'rinish o'rami: three.js faqat shu komponent ochilganda dinamik yuklanadi.
import { useEffect, useRef, useState } from 'react';
import type { Engine, EngineBlock, EnginePick, EngineSel } from './engine';

type Props = {
  blocks: EngineBlock[];
  sel: EngineSel;
  reducedMotion: boolean;
  label: string;          // canvas uchun aria-label
  conceptLabel: string;   // "Konsept ko'rinish — texnik reja emas"
  loadingLabel: string;
  onPick: (p: EnginePick) => void;
  onFail: () => void;
};

export default function Scene3D({ blocks, sel, reducedMotion, label, conceptLabel, loadingLabel, onPick, onFail }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const selRef = useRef(sel);
  const pickRef = useRef(onPick);
  const failRef = useRef(onFail);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selRef.current = sel;
    pickRef.current = onPick;
    failRef.current = onFail;
  });

  // Sahnani yaratish / ma'lumot o'zgarsa qayta qurish; unmount'da tozalash
  useEffect(() => {
    let alive = true;
    let eng: Engine | null = null;
    import('./engine')
      .then((m) => {
        const canvas = canvasRef.current;
        if (!alive || !canvas) return;
        try {
          eng = m.createEngine(canvas, {
            blocks,
            reducedMotion,
            onPick: (p) => pickRef.current(p),
            onLost: () => failRef.current(),
          });
          engineRef.current = eng;
          eng.update(selRef.current);
          setReady(true);
        } catch {
          failRef.current();
        }
      })
      .catch(() => { if (alive) failRef.current(); });
    return () => {
      alive = false;
      eng?.dispose();
      engineRef.current = null;
    };
  }, [blocks, reducedMotion]);

  // Tanlov o'zgarganda kamera/kesimni yangilaymiz
  useEffect(() => { engineRef.current?.update(sel); }, [sel]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-v-lg border border-line bg-surface-sunken">
      <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full touch-pan-y cursor-pointer">
        {label}
      </canvas>
      <p className="pointer-events-none absolute left-3 top-3 rounded-v-md bg-surface/90 px-2.5 py-1 text-caption uppercase text-ink shadow-v-md">
        {conceptLabel}
      </p>
      {!ready && (
        <p className="absolute inset-0 grid place-items-center text-small text-ink-muted" aria-hidden="true">{loadingLabel}</p>
      )}
    </div>
  );
}
