'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, PerformanceMonitor, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, MousePointerClick } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/dictionaries';
import type { SceneBuilding, SceneData } from '@/lib/scene';
import ScenePanel from './ScenePanel';
import ProjectLeadModal from './ProjectLeadModal';

/*
  Mavze 3D turi (1-bosqich, MVP). Faqat brauzerda ishlaydi (Scene3DLoader: ssr:false).

  Qoidalar — placeholderga bog'lanmagan, haqiqiy .glb bilan ham xuddi shunday ishlaydi:
  • scene_pins.mesh_name ga mos mesh (yoki shu nomli guruh ichidagi hamma mesh) — sotuvdagi blok:
    brend teal rangda, tanlanganda bronza bilan yoritiladi.
  • userData.keep = true bo'lgan meshlar (yer, yo'l, daraxt) o'z materialida qoladi.
  • Qolgan hamma mesh — och kulrang; bosilganda kichik "Tez kunda" yozuvi, panel ochilmaydi.
  • Kamera masofalari model o'lchamidan (chegaralovchi sfera) hisoblanadi — model katta-kichikligi
    yoki birligi o'zgarsa ham umumiy ko'rinish va kirish animatsiyasi to'g'ri ishlaydi.

  Telefon uchun: dpr 1.5 dan oshmaydi, soyalar o'chiq, kadr tezligi tushsa PerformanceMonitor
  dpr'ni pasaytiradi.
*/

const TEAL = '#014242';
const BRONZE = '#D18E5B';
const NEUTRAL = '#cfd4d8';
const SKY = '#dfe9e6';
const MAX_DPR = 1.5;
const MIN_DPR = 0.75;
const PLACEHOLDER = '/3d/placeholder.glb';

type Vec3 = [number, number, number];
// Binolar chegarasi: markaz, eni (x) va chuqurligi (z), chegaralovchi sfera radiusi
type Bounds = { center: Vec3; radius: number; sx: number; sz: number };
const FOV = 45;
type Flight = { from?: Vec3; pos: Vec3; target: Vec3; duration: number; key: number };
// OrbitControls'dan kerakli qism (three-stdlib turiga bog'lanmaslik uchun)
type Controls = { target: THREE.Vector3; update: () => void; enabled: boolean };

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const nameOf = (b: SceneBuilding, lang: Locale) =>
  b[`label_${lang}`] || b.project[`name_${lang}`] || b.label_uz || b.project.name_uz;

// Binolar chegarasi. Yer va yo'l kabi yassi yoki keep meshlar hisobga olinmaydi — aks holda katta
// yer maydoni tufayli kamera keragidan uzoqda turardi. Bino topilmasa — butun sahna.
function boundsOf(scene: THREE.Object3D): Bounds {
  const box = new THREE.Box3();
  const one = new THREE.Box3();
  const size = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.userData?.keep) return;
    one.setFromObject(m).getSize(size);
    if (size.y < 0.015 * Math.max(size.x, size.z)) return; // yassi (yer, yo'l)
    box.union(one);
  });
  if (box.isEmpty()) box.setFromObject(scene);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  box.getSize(size);
  return {
    center: [sphere.center.x, sphere.center.y, sphere.center.z],
    radius: Math.max(1, sphere.radius),
    sx: Math.max(1, size.x),
    sz: Math.max(1, size.z),
  };
}

// Umumiy ko'rinish: butun mavze ekranga sig'adigan masofa (ekran nisbati va binolar chegarasidan).
// Yotiq ekranda mavzening uzun tomoniga ko'ndalang, tik ekranda (telefon) uzun tomoni bo'ylab qaraydi.
// Kamera pinlar joylashgan tomonda turadi — sotuvdagi bloklar old planda.
function overviewOf(bounds: Bounds, buildings: SceneBuilding[]): { from: Vec3; pos: Vec3; target: Vec3 } {
  const [cx, , cz] = bounds.center;
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const longIsX = bounds.sx >= bounds.sz;
  const viewAlongX = aspect < 1 ? longIsX : !longIsX; // kamera qaysi o'q bo'ylab qaraydi
  const across = viewAlongX ? bounds.sz : bounds.sx;
  const depth = viewAlongX ? bounds.sx : bounds.sz;
  const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const d = ((across / 2) / (halfH * aspect) + depth / 2) * 1.22;

  const n = buildings.length;
  const px = n ? buildings.reduce((s, b) => s + b.x, 0) / n : cx;
  const pz = n ? buildings.reduce((s, b) => s + b.z, 0) / n : cz;
  const side = (viewAlongX ? px < cx : pz < cz) ? -1 : 1;
  const elev = THREE.MathUtils.degToRad(aspect < 1 ? 40 : 34);
  const h = Math.cos(elev) * d; // gorizontal masofa
  const skew = h * 0.32; // biroz yondan — 3/4 ko'rinish
  const at = (along: number, sideways: number, y: number): Vec3 =>
    viewAlongX ? [cx + side * along, y, cz + sideways] : [cx + sideways, y, cz + side * along];
  return {
    target: [cx, 0, cz],
    pos: at(h * 0.95, skew, Math.sin(elev) * d),
    from: at(h * 1.5, skew * 0.3, d * 1.9), // kirish: yuqoridan va uzoqdan
  };
}

// Mesh yoki uning ota guruhlaridan biri pin nomiga mos kelsa — o'sha nomni qaytaradi
function pinnedNameOf(obj: THREE.Object3D | null, names: Set<string>): string | null {
  for (let o = obj; o; o = o.parent) if (o.name && names.has(o.name)) return o.name;
  return null;
}

// Model yuklanmasa (admin noto'g'ri manzil kiritgan bo'lsa) — placeholderga qaytish uchun
class ModelBoundary extends React.Component<{ onError: () => void; resetKey: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() { return this.state.failed ? null : this.props.children; }
}

function Model({
  url, pinnedNames, selectedName, onPick, onSoon, onReady,
}: {
  url: string;
  pinnedNames: Set<string>;
  selectedName: string | null;
  onPick: (meshName: string) => void;
  onSoon: (point: Vec3) => void;
  onReady: (bounds: Bounds) => void;
}) {
  const { scene } = useGLTF(url);
  const neutral = useMemo(() => new THREE.MeshStandardMaterial({ color: NEUTRAL, roughness: 0.95 }), []);
  const pinMats = useRef(new Map<string, THREE.MeshStandardMaterial>());

  // Materiallarni qoidaga ko'ra taqsimlash: pin bloklari — teal, keep — o'zi, qolgani — kulrang
  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = false;
      m.receiveShadow = false;
      if (m.userData?.keep) return;
      const pin = pinnedNameOf(m, pinnedNames);
      if (!pin) { m.material = neutral; return; }
      let mat = pinMats.current.get(pin);
      if (!mat) {
        mat = new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.7 });
        pinMats.current.set(pin, mat);
      }
      m.material = mat;
    });
    onReady(boundsOf(scene));
  }, [scene, pinnedNames, neutral, onReady]);

  // Tanlangan blok — bronza, qolgan pin bloklari — teal
  useEffect(() => {
    pinMats.current.forEach((mat, name) => {
      const on = name === selectedName;
      mat.color.set(on ? BRONZE : TEAL);
      mat.emissive.set(on ? BRONZE : '#000000');
      mat.emissiveIntensity = on ? 0.35 : 0;
    });
  }, [selectedName, pinnedNames]);

  // Tanlangan blok sekin "nafas oladi"
  useFrame(({ clock }) => {
    if (!selectedName) return;
    const mat = pinMats.current.get(selectedName);
    if (mat) mat.emissiveIntensity = 0.3 + 0.18 * Math.sin(clock.elapsedTime * 3);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // bu aylantirish (drag) edi, bosish emas
    const pin = pinnedNameOf(e.object, pinnedNames);
    // keep mesh (deraza, daraxt, yer) bosilsa — hodisa to'xtatilmaydi va nur orqasidagi binoga o'tadi
    if (!pin && e.object.userData?.keep) return;
    e.stopPropagation();
    if (pin) onPick(pin);
    else onSoon([e.point.x, e.point.y, e.point.z]);
  };

  return <primitive object={scene} onClick={handleClick} />;
}

// Kamera parvozi: kirish animatsiyasi va pin tanlanganda silliq uchish
function CameraRig({ flight, radius, onDone }: { flight: Flight | null; radius: number; onDone: (key: number) => void }) {
  const pending = useRef<Flight | null>(null);
  const scaled = useRef(0);
  const anim = useRef<{ fromP: THREE.Vector3; toP: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number; dur: number; key: number } | null>(null);

  // Yangi parvoz navbatga qo'yiladi; kamera va boshqaruv faqat kadr ichida (useFrame) o'zgartiriladi
  useEffect(() => { pending.current = flight; }, [flight]);

  useFrame((state, dt) => {
    const controls = state.controls as unknown as Controls | null;
    if (!controls) return; // OrbitControls hali ulanmagan — keyingi kadrda
    const camera = state.camera as THREE.PerspectiveCamera;
    // Ko'rish chegaralari model o'lchamiga mos (kichik modelda ham, katta mavzeda ham kesilmasin)
    if (radius > 0 && scaled.current !== radius) {
      scaled.current = radius;
      camera.near = radius / 300;
      camera.far = radius * 40;
      camera.updateProjectionMatrix();
    }
    const f = pending.current;
    if (f) {
      pending.current = null;
      if (f.from) camera.position.set(...f.from);
      anim.current = {
        fromP: camera.position.clone(), toP: new THREE.Vector3(...f.pos),
        fromT: f.from ? new THREE.Vector3(...f.target) : controls.target.clone(), toT: new THREE.Vector3(...f.target),
        t: 0, dur: f.duration, key: f.key,
      };
      controls.enabled = false;
    }
    const a = anim.current;
    if (!a) return;
    // dt cheklangan: brauzer kadrlarni siyraklashtirsa (fon oynasi, zaif telefon) ham parvoz sakramaydi
    a.t = Math.min(1, a.t + Math.min(dt, 0.25) / a.dur);
    const k = a.t < 0.5 ? 4 * a.t ** 3 : 1 - Math.pow(-2 * a.t + 2, 3) / 2; // easeInOutCubic
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    controls.update();
    if (a.t >= 1) {
      anim.current = null;
      controls.enabled = true;
      onDone(a.key);
    }
  });
  return null;
}

function Pin({ b, label, freeLabel, selected, stagger, onSelect }: {
  b: SceneBuilding; label: string; freeLabel: string; selected: boolean; stagger: boolean; onSelect: () => void;
}) {
  const free = b.counts.available;
  // Bo'sh xonadoni bor bloklar va tanlangan blok — boshqa yozuvlar ustida
  const z: [number, number] = selected ? [60, 51] : free > 0 ? [50, 41] : [30, 11];
  return (
    <Html position={[b.x, b.y, b.z]} zIndexRange={z}>
      <div style={{ transform: 'translate(-50%, -100%)' }} className="flex flex-col items-center select-none">
        <button
          type="button"
          onClick={onSelect}
          aria-label={`${label}: ${free} ${freeLabel}`}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold shadow-lg border transition-colors ${
            selected
              ? 'bg-accent text-primary border-white pl-2.5 pr-1.5 py-1 text-[12px]'
              : free > 0
                ? 'bg-white text-primary border-white hover:bg-accent pl-2.5 pr-1.5 py-1 text-[12px]'
                : 'bg-white/85 text-primary/60 border-white/60 hover:bg-white px-2 py-0.5 text-[10px]'
          }`}
        >
          {label}
          {(free > 0 || selected) && (
            <span className="min-w-[22px] rounded-full bg-primary text-white px-1.5 py-0.5 text-[11px] leading-none text-center">{free}</span>
          )}
        </button>
        <span className={`w-0.5 bg-white/90 shadow ${free > 0 || selected ? (stagger ? 'h-10' : 'h-5') : stagger ? 'h-4' : 'h-1.5'}`} />
        <span className={`w-2 h-2 rounded-full border border-white ${selected ? 'bg-accent' : 'bg-primary'}`} />
      </div>
    </Html>
  );
}

export default function Scene3D({ lang, initialProject }: { lang: Locale; initialProject?: number }) {
  const dict = getDictionary(lang);
  const t = dict.tour3d;

  const [webgl] = useState(hasWebGL);
  const [data, setData] = useState<SceneData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [soon, setSoon] = useState<{ pos: Vec3; key: number } | null>(null);
  const [booking, setBooking] = useState<SceneBuilding | null>(null);
  // Komponent faqat brauzerda ishlaydi (ssr: false) — window bu yerda bor. Telefonda dpr 1.5 dan oshmaydi.
  const [dpr, setDpr] = useState(() => Math.min(MAX_DPR, window.devicePixelRatio || 1));
  const flightKey = useRef(0);
  const { progress } = useProgress();
  const ready = bounds !== null;
  const radius = bounds?.radius ?? 0;

  // Bitta so'rov: model manzili + pinlar + loyiha va xonadonlar
  useEffect(() => {
    let off = false;
    fetch('/api/3d/scene')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: SceneData) => {
        if (off) return;
        setData(d);
        setModelUrl(`${d.modelUrl}${d.modelUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(d.version)}`);
      })
      .catch(() => { if (!off) setLoadError(true); });
    return () => { off = true; };
  }, []);

  const buildings = useMemo(() => data?.buildings ?? [], [data]);
  const pinnedNames = useMemo(() => new Set(buildings.map((b) => b.mesh_name).filter((n): n is string => Boolean(n))), [buildings]);
  const selected = buildings.find((b) => b.id === selectedId) || null;

  const fly = useCallback((f: Omit<Flight, 'key'>) => {
    flightKey.current += 1;
    setFlight({ ...f, key: flightKey.current });
  }, []);

  const select = useCallback((b: SceneBuilding) => {
    setSelectedId(b.id);
    setSoon(null);
    const r = bounds?.radius ?? 170;
    // Admin kamera nuqtasini kiritmagan bo'lsa (0, 0, 0) — pin yonidan, model o'lchamiga mos masofadan
    const cam: Vec3 = b.cam_x || b.cam_y || b.cam_z
      ? [b.cam_x, b.cam_y, b.cam_z]
      : [b.x + r * 0.22, b.y + r * 0.24, b.z + r * 0.33];
    // Tik ekranda (telefon) gorizontal ko'rish burchagi tor — bino sig'ishi uchun kamera uzoqroq turadi
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const k = aspect < 1 ? Math.min(2.4, 0.8 / aspect) : 1;
    const pos: Vec3 = [b.x + (cam[0] - b.x) * k, b.y + (cam[1] - b.y) * k, b.z + (cam[2] - b.z) * k];
    const dist = Math.hypot(pos[0] - b.x, pos[1] - b.y, pos[2] - b.z);
    // Telefonda panel ekranning pastki ~58% ini yopadi — bino yuqori qismda ko'rinishi uchun pastroqqa qaraymiz
    const narrow = window.innerWidth < 768;
    fly({ pos, target: [b.x, narrow ? b.y * 0.5 - dist * 0.24 : b.y * 0.5, b.z], duration: 1.5 });
  }, [fly, bounds]);

  const toOverview = useCallback(() => {
    if (!bounds) return;
    const o = overviewOf(bounds, buildings);
    fly({ pos: o.pos, target: o.target, duration: 1.6 });
  }, [fly, bounds, buildings]);

  // Model tayyor bo'lgach — kirish animatsiyasi: kamera yuqoridan mavzega uchib keladi (bir marta)
  const onModelReady = useCallback((b: Bounds) => {
    setBounds(b);
    if (flightKey.current !== 0) return;
    const o = overviewOf(b, buildings);
    fly({ from: o.from, pos: o.pos, target: o.target, duration: 3.2 });
  }, [buildings, fly]);

  // Kirish parvozi (1-parvoz) tugagach: ?project=<id> bilan kelingan bo'lsa (loyiha sahifasidagi
  // "3D'da ko'rish") — o'sha loyiha bloki ochiladi
  const onFlightDone = useCallback((key: number) => {
    if (key !== 1 || !initialProject) return;
    const b = buildings.find((x) => x.project_id === initialProject);
    if (b) select(b);
  }, [buildings, initialProject, select]);

  // "Tez kunda" yozuvi 2 soniyada yo'qoladi
  useEffect(() => {
    if (!soon) return;
    const id = window.setTimeout(() => setSoon(null), 2000);
    return () => window.clearTimeout(id);
  }, [soon]);

  const onPick = useCallback((meshName: string) => {
    const b = buildings.find((x) => x.mesh_name === meshName);
    if (b) select(b);
  }, [buildings, select]);

  const onSoon = useCallback((pos: Vec3) => setSoon({ pos, key: Date.now() }), []);
  const onModelError = useCallback(() => {
    // Admin kiritgan model ochilmadi — placeholderga qaytamiz (sahna bo'sh qolmasin)
    setModelUrl((u) => (u && !u.startsWith(PLACEHOLDER) ? PLACEHOLDER : u));
  }, []);

  // WebGL yo'q yoki ma'lumot kelmadi — matnli ro'yxat
  if (!webgl || loadError) {
    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#dfe9e6] px-5 pt-24 pb-10">
        <div className="max-w-2xl mx-auto">
          <p className="text-primary font-bold text-lg mb-5">{loadError ? t.error : t.noWebgl}</p>
          <ul className="space-y-3">
            {buildings.map((b) => (
              <li key={b.id}>
                <Link href={`/${lang}/projects/${b.project_id}`} className="flex items-center justify-between gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-bold text-primary">{nameOf(b, lang)}</span>
                  <span className="text-sm text-gray-500 shrink-0">
                    <b className="text-primary">{b.counts.available}</b> {t.available} / {b.counts.total} {t.total}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {(loadError || buildings.length === 0) && (
            <Link href={`/${lang}/projects`} className="inline-block mt-2 px-6 py-3 bg-primary text-white font-bold rounded-xl">{dict.nav.projects}</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {modelUrl && (
        <Canvas
          dpr={dpr}
          shadows={false}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          camera={{ position: [60, 400, 500], fov: FOV, near: 1, far: 5000 }}
        >
          <color attach="background" args={[SKY]} />
          {ready && <fog attach="fog" args={[SKY, radius * 5, radius * 14]} />}
          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#ffffff', '#9fb0a8', 0.9]} />
          <directionalLight position={[120, 200, 80]} intensity={1.6} />

          {/* Kadr tezligi tushsa — piksel zichligini pasaytiramiz (0.75 gacha), tiklansa qaytaramiz */}
          <PerformanceMonitor
            onChange={({ factor }) => {
              const max = Math.min(MAX_DPR, window.devicePixelRatio || 1);
              setDpr(Math.round((MIN_DPR + (max - MIN_DPR) * factor) * 100) / 100);
            }}
            onFallback={() => setDpr(MIN_DPR)}
          />

          <ModelBoundary onError={onModelError} resetKey={modelUrl}>
            <Suspense fallback={null}>
              <Model
                url={modelUrl}
                pinnedNames={pinnedNames}
                selectedName={selected?.mesh_name || null}
                onPick={onPick}
                onSoon={onSoon}
                onReady={onModelReady}
              />
            </Suspense>
          </ModelBoundary>

          {ready && buildings.map((b, i) => (
            <Pin
              key={b.id}
              b={b}
              label={nameOf(b, lang)}
              freeLabel={t.available}
              selected={b.id === selectedId}
              stagger={i % 2 === 1}
              onSelect={() => select(b)}
            />
          ))}

          {soon && (
            <Html key={soon.key} position={soon.pos} zIndexRange={[70, 61]}>
              <div style={{ transform: 'translate(-50%, -130%)' }} className="pointer-events-none whitespace-nowrap rounded-full bg-primary/90 text-white text-[12px] font-bold px-3 py-1.5 shadow-lg animate-fade-in">
                {t.soon}
              </div>
            </Html>
          )}

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={ready ? radius * 0.2 : 1}
            maxDistance={ready ? radius * 9 : 5000}
            maxPolarAngle={Math.PI / 2 - 0.08}
          />
          <CameraRig flight={flight} radius={radius} onDone={onFlightDone} />
        </Canvas>
      )}

      {/* Yuklanish progress chizig'i */}
      {!ready && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#dfe9e6]" role="status" aria-live="polite">
          <p className="text-primary font-bold mb-4">{t.loading}</p>
          <div className="w-56 h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${Math.max(6, Math.round(progress))}%` }} />
          </div>
          <p className="text-primary/50 text-xs mt-2 tabular-nums">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Pastki chap: ko'rsatma va "Umumiy ko'rinish" */}
      {ready && (
        <div className={`absolute left-3 md:left-5 bottom-3 md:bottom-5 z-20 flex-col items-start gap-2 ${selected ? 'hidden md:flex' : 'flex'}`}>
          <button
            type="button"
            onClick={() => { setSelectedId(null); toOverview(); }}
            className="flex items-center gap-2 rounded-full bg-white/95 text-primary text-xs font-bold px-3.5 py-2 shadow-lg hover:bg-accent transition-colors"
          >
            <Maximize2 size={14} /> {t.overview}
          </button>
          <p className="flex items-center gap-2 max-w-[260px] md:max-w-none rounded-2xl bg-primary/80 text-white/90 text-[11px] leading-snug px-3 py-2">
            <MousePointerClick size={14} className="shrink-0 text-accent" /> {t.hint}
          </p>
          <p className="max-w-[260px] md:max-w-none text-[11px] text-primary/60 px-1">{t.conceptNote}</p>
        </div>
      )}

      {selected && (
        <ScenePanel
          key={selected.id}
          b={selected}
          name={nameOf(selected, lang)}
          lang={lang}
          modalOpen={booking !== null}
          onClose={() => setSelectedId(null)}
          onBook={() => setBooking(selected)}
        />
      )}

      {/* Mavjud ariza oqimi (submitContact → baza, Telegram, amoCRM); izohda "3D tur, <bino nomi>" */}
      {booking && (
        <ProjectLeadModal
          projectName={nameOf(booking, lang)}
          lang={lang}
          variant="viewing"
          tag={`3D tur, ${booking.label_uz || booking.project.name_uz}`}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}
