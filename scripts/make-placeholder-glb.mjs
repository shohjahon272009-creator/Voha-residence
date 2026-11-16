/*
  Placeholder mavze modeli: public/3d/placeholder.glb + src/lib/placeholderLayout.json
  Haqiqiy 3D model (arxitektordan) kelguncha sahna shu bilan ishlaydi.

  Joylashuv rahbar bergan planirovka renderi bo'yicha (Urganch, Shovot kanali yoni):
  • Janubiy guruh (topshirilgan/sotuvdagi): katta yo'l bo'ylab chapdan o'ngga 4, 3, 2, 1;
    kanal bo'ylab 5 va 6; ichkarida 8; orqa qatorda 7.
  • Shimoliy guruh: 10 va 11, qolganlari keyingi navbat bloklari (12 dan boshlab, pin yo'q).
  • 9-blok yo'q.
  O'lchamlar va aniq koordinatalar taxminiy — renderdan ko'z bilan olingan.

  Ishga tushirish:  node scripts/make-placeholder-glb.mjs

  Nomlash qoidasi (haqiqiy .glb ham shunga amal qilsin):
  • Har blok — `blok_<n>` nomli guruh (ichida detal va oyna meshlari, blok bir nechta seksiyadan iborat
    bo'lishi mumkin). scene_pins.mesh_name shu nom.
  • Bino bo'lmagan hamma narsa (yer, yo'l, kanal, soya, daraxt, mashina, atrof) userData.keep = true —
    sayt ularning materialiga tegmaydi va ularni "bino" deb hisoblamaydi.
  • scene.userData.viewDir — umumiy ko'rinishda kamera qaysi tomondan qarashi (x, z).

  Soyalar real vaqtda hisoblanmaydi (telefon uchun og'ir): quyosh yo'nalishi bo'yicha yerga
  "pishirilgan" yarim shaffof shakllar. SUN src/components/website/Scene3D.tsx dagi bilan bir xil.

  Skript pin va kamera nuqtalarini src/lib/placeholderLayout.json ga yozadi — db.ts dagi seed shundan o'qiydi.
*/
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// GLTFExporter brauzer FileReader'ini ishlatadi — Node'da yo'q, minimal nusxa
if (!globalThis.FileReader) {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((b) => {
        this.result = `data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;
        this.onloadend?.();
      });
    }
  };
}

const FLOOR_H = 3;
const SUN = [70, 190, 170]; // = Scene3D.tsx SUN (kamera janubi-sharqdan qaraydi — ko'rinadigan fasadlar yorug')
const VIEW_DIR = [0.5, 1]; // umumiy ko'rinish: janubi-sharqdan (renderdagi kabi)

// Takrorlanadigan tasodif (har ishga tushirishda bir xil model chiqsin)
let seed = 20261116;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const scene = new THREE.Scene();
scene.name = 'voha_placeholder';
scene.userData.viewDir = VIEW_DIR;

// Geometriyaga bitta rang (vertex color) beradi — bir nechta rangli detal bitta meshga birlashadi.
// Normal va uv olib tashlanadi: material flatShading bilan chiziladi, fayl 3 barobar ixcham.
const paint = (geo, hex) => {
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  const g = geo.index ? geo : mergeVertices(geo);
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
};
// Quti: 8 ta uch, ostki yuzasiz (yerda turgan narsaning osti ko'rinmaydi)
const BOX_INDEX = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
const box = (w, h, d, x, y, z, hex) => {
  const [a, b, c] = [w / 2, h / 2, d / 2];
  const p = [-a, -b, c, a, -b, c, a, -b, -c, -a, -b, -c, -a, b, c, a, b, c, a, b, -c, -a, b, -c];
  for (let i = 0; i < 24; i += 3) { p[i] += x; p[i + 1] += y; p[i + 2] += z; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setIndex(BOX_INDEX.slice(6));
  return paint(g, hex);
};
const colored = (geos, name, opts = {}) => {
  const m = new THREE.Mesh(
    mergeGeometries(geos),
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, ...opts }),
  );
  m.name = name;
  return m;
};
const keep = (o) => { o.userData.keep = true; return o; };

// ---------- Planirovka ----------
// Koordinatalar: x — katta yo'l bo'ylab (sharqqa), z — yo'ldan ichkariga manfiy (shimolga). Birlik: metr.
// Seksiya: b — blok raqami, x/z — markaz, w — uzunligi, d — eni, fl — qavat, rot — 90 bo'lsa uzun tomoni z bo'ylab,
// st — fasad uslubi, front — lodjiyalar qaysi tomonga (lokal z: 1 yoki -1).
// Fasad uslublari (renderdagi bino turlari bo'yicha):
// band — qavatlararo gorizontal chiziq rangi; stripe — derazalar ortidagi tik to'q tasma (oq-kulrang uylar);
// crown — yuqori ikki qavat rangi; arches — yuqori qavatda arkali derazalar; rail — balkon panjarasi;
// curtain — fasadning katta qismi oyna devor (4-blok).
const ST = {
  beige: { wall: '#ead9b8', accent: '#9a7550', slab: '#f6efdf', plinth: '#6f5d4c', band: '#f3e9d2', crown: '#a47b55', arches: true, rail: '#3b3f44' }, // 1, 2, 3
  white: { wall: '#f1f3f4', accent: '#c9d3d9', slab: '#ffffff', plinth: '#5f666b', band: '#ffffff', rail: '#9fb6c2', curtain: true }, // 4
  brown: { wall: '#b08a63', accent: '#6f5138', slab: '#e2cfb3', plinth: '#5b4a3c', band: '#d9c2a3', crown: '#7a5a40', rail: '#4a3a2e' }, // 5
  teal: { wall: '#3f8f8c', accent: '#256a69', slab: '#f2f6f5', plinth: '#3d4a4a', band: '#f2f6f5', crown: '#2c7673', rail: '#f2f6f5' }, // 6
  gray: { wall: '#eceef0', accent: '#565f66', slab: '#f7f8f9', plinth: '#4f565c', stripe: '#3e474e', rail: '#30373c' }, // 7, 8
  amber: { wall: '#e3b877', accent: '#8a5f3a', slab: '#faf0dc', plinth: '#6b5644', band: '#faf0dc', crown: '#9c6b3f', rail: '#4a3a2e' }, // 10 va atrofi
};
const SECTIONS = [
  // Yo'l bo'yi (old qator), chapdan o'ngga: 4, 3, 2, 1
  { b: 4, x: -108, z: 84, w: 22, d: 17, fl: 12, st: 'white', front: 1 },
  { b: 3, x: -76, z: 85, w: 32, d: 14, fl: 10, st: 'beige', front: 1 },
  { b: 3, x: -43, z: 85, w: 32, d: 14, fl: 10, st: 'beige', front: 1 },
  { b: 2, x: 4, z: 85, w: 33, d: 14, fl: 9, st: 'beige', front: 1 },
  { b: 2, x: 38, z: 85, w: 33, d: 14, fl: 9, st: 'beige', front: 1 },
  { b: 1, x: 72, z: 85, w: 33, d: 14, fl: 9, st: 'beige', front: 1 },
  { b: 1, x: 106, z: 85, w: 33, d: 14, fl: 9, st: 'beige', front: 1 },
  { b: 1, x: 134, z: 62, w: 40, d: 15, fl: 11, st: 'amber', rot: 90, front: -1 },
  // Kanal bo'yi: 5, keyin 6 (to'rt seksiya)
  { b: 5, x: -112, z: 57, w: 26, d: 14, fl: 7, st: 'brown', rot: 90, front: 1 },
  { b: 6, x: -113, z: 28, w: 21, d: 15, fl: 10, st: 'teal', rot: 90, front: 1 },
  { b: 6, x: -110, z: 5, w: 21, d: 15, fl: 11, st: 'teal', rot: 90, front: 1 },
  { b: 6, x: -107, z: -18, w: 21, d: 15, fl: 11, st: 'teal', rot: 90, front: 1 },
  { b: 6, x: -104, z: -41, w: 21, d: 15, fl: 10, st: 'teal', rot: 90, front: 1 },
  // Ichki hovli: 8
  { b: 8, x: -62, z: 30, w: 26, d: 14, fl: 9, st: 'gray', rot: 90, front: 1 },
  { b: 8, x: -62, z: 3, w: 26, d: 14, fl: 9, st: 'gray', rot: 90, front: 1 },
  { b: 8, x: -62, z: -24, w: 26, d: 14, fl: 9, st: 'gray', rot: 90, front: 1 },
  { b: 8, x: -12, z: 36, w: 26, d: 14, fl: 9, st: 'gray', rot: 90, front: -1 },
  { b: 8, x: -12, z: 9, w: 26, d: 14, fl: 9, st: 'gray', rot: 90, front: -1 },
  { b: 8, x: 36, z: 34, w: 20, d: 17, fl: 9, st: 'gray', front: 1 },
  { b: 8, x: 70, z: 14, w: 20, d: 17, fl: 10, st: 'gray', front: 1 },
  // Orqa qator: 7
  { b: 7, x: -76, z: -62, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: -51, z: -62, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: -26, z: -62, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: 14, z: -58, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: 39, z: -58, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: 64, z: -58, w: 24, d: 14, fl: 9, st: 'gray', front: -1 },
  { b: 7, x: 98, z: -40, w: 22, d: 17, fl: 10, st: 'gray', front: -1 },
  // Shimoliy guruh: 10 va 11
  { b: 10, x: 112, z: -168, w: 22, d: 17, fl: 9, st: 'amber', front: 1 },
  { b: 10, x: 96, z: -194, w: 22, d: 17, fl: 10, st: 'amber', front: 1 },
  { b: 11, x: 62, z: -276, w: 22, d: 17, fl: 9, st: 'amber', front: 1 },
];
// Shimoliy guruhning qolgan (keyingi navbat) bloklari: 12 dan boshlab, pin yo'q
const FUTURE = [
  [28, -196, 'gray'], [58, -202, 'teal'], [140, -196, 'teal'], [168, -182, 'amber'], [196, -196, 'gray'],
  [14, -226, 'amber'], [42, -232, 'gray'], [72, -236, 'teal'], [102, -230, 'amber'], [132, -228, 'gray'], [162, -222, 'teal'], [192, -226, 'amber'],
  [30, -262, 'teal'], [94, -268, 'gray'], [124, -262, 'amber'], [154, -258, 'gray'], [184, -256, 'teal'],
  [88, -298, 'teal'], [118, -294, 'amber'], [148, -290, 'gray'], [178, -286, 'amber'],
];
FUTURE.forEach(([x, z, st], i) => {
  SECTIONS.push({ b: 12 + i, x, z, w: 22, d: 17, fl: 9 + ((i * 5) % 3), st, front: i % 2 ? 1 : -1 });
});

// Shovot kanali o'q chizig'i (janubi-g'arbdan shimoli-sharqqa buriladi)
const CANAL = [[-290, 520], [-250, 300], [-218, 160], [-196, 60], [-180, -20], [-158, -100], [-118, -180], [-62, -250], [20, -318], [140, -372], [330, -430], [620, -500]];
const distToCanal = (x, z) => {
  let best = Infinity;
  for (let i = 0; i < CANAL.length - 1; i++) {
    const [ax, az] = CANAL[i];
    const [bx, bz] = CANAL[i + 1];
    const [dx, dz] = [bx - ax, bz - az];
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return best;
};
// Mavze hududi (shahar uylari bu yerga qo'yilmaydi)
const SITE = { x0: -175, x1: 245, z0: -330, z1: 140 };
const inSite = (x, z, m = 0) => x > SITE.x0 - m && x < SITE.x1 + m && z > SITE.z0 - m && z < SITE.z1 + m;
const footprint = (s) => (s.rot === 90 ? [s.d, s.w] : [s.w, s.d]);
const onBuilding = (x, z, m = 3) => SECTIONS.some((s) => {
  const [fw, fd] = footprint(s);
  return Math.abs(x - s.x) < fw / 2 + m && Math.abs(z - s.z) < fd / 2 + m;
});

// ---------- Soyalar ----------
const shadowGeos = [];
const [sunX, sunY, sunZ] = SUN;
const shadowDir = [-sunX / sunY, -sunZ / sunY]; // balandlik birligiga soya siljishi
// Qavariq qobiq (monotone chain) — bino soyasi poligoni uchun
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  const up = [];
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};
const shadowOf = (x, z, w, d, h, y = 0.42) => {
  const [ox, oz] = [shadowDir[0] * h, shadowDir[1] * h];
  const base = [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]];
  const hp = hull(base.concat(base.map(([a, b]) => [a + ox, b + oz])));
  const pos = [];
  for (let i = 1; i < hp.length - 1; i++) {
    pos.push(hp[0][0], y, hp[0][1], hp[i + 1][0], y, hp[i + 1][1], hp[i][0], y, hp[i][1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
};

// ---------- Atrof: ufqgacha yer va past qavatli shahar (o'zgarmagan uslub) ----------
const far = new THREE.Mesh(new THREE.CircleGeometry(2600, 48), new THREE.MeshStandardMaterial({ color: '#a7af98', roughness: 1 }));
far.rotation.x = -Math.PI / 2;
far.position.y = -0.3;
far.name = 'atrof_yer';
scene.add(keep(far));

const cityGeos = [];
const streetGeos = [];
const HOUSE = ['#ddd6c8', '#d2cbbd', '#c9ced1', '#e4dfd3', '#c2bbae', '#d8d2c4'];
const ROOF = ['#9a5f4c', '#84766b', '#74828b', '#a8735b', '#6d6a66', '#8f4f42'];
const FIELD = ['#a3b09a', '#b4bba3', '#9fae93', '#b9b59c', '#a9b7a4'];
const CELL = { x: 62, z: 52 };
const CITY_R = 820;
const CITY_C = [30, -90]; // shahar markazi — mavze o'rtasi
const cityHouses = [];
for (let gx = -14; gx <= 14; gx++) {
  for (let gz = -16; gz <= 16; gz++) {
    const cx = CITY_C[0] + gx * CELL.x;
    const cz = CITY_C[1] + gz * CELL.z;
    if (Math.hypot(cx - CITY_C[0], (cz - CITY_C[1]) * 1.1) > CITY_R) continue;
    if (inSite(cx, cz, CELL.x / 2) || distToCanal(cx, cz) < 75) continue;
    const kind = rnd();
    if (kind < 0.08) { cityGeos.push(box(CELL.x - 12, 0.12, CELL.z - 12, cx, 0.02, cz, pick(FIELD))); continue; } // bo'sh maydon / bog'
    if (kind < 0.2) { // 5 qavatli panel uy
      const h = 15 + Math.floor(rnd() * 3) * 3;
      cityHouses.push([cx, cz + (rnd() - 0.5) * 10, 40, 12, h, pick(HOUSE), '#55595e']);
      continue;
    }
    for (let ix = -1; ix <= 1; ix++) {
      for (const iz of [-1, 1]) {
        if (rnd() < 0.22) continue;
        const w = 9 + rnd() * 6, d = 8 + rnd() * 5, h = 3.4 + rnd() * 3.2;
        cityHouses.push([cx + ix * 16 + (rnd() - 0.5) * 3, cz + iz * 11 + (rnd() - 0.5) * 3, w, d, h, pick(HOUSE), pick(ROOF)]);
      }
    }
  }
}
for (const [x, z, w, d, h, wallC, roofC] of cityHouses) {
  cityGeos.push(box(w, h, d, x, h / 2 - 0.3, z, wallC));
  cityGeos.push(box(w + 0.8, 0.5, d + 0.8, x, h - 0.05, z, roofC));
  shadowGeos.push(shadowOf(x, z, w, d, h, -0.1));
}
// Shahar ko'chalari: mavze va kanal ustidan o'tmasligi uchun kvartal bo'laklari bilan
for (let gx = -14; gx <= 15; gx++) {
  for (let gz = -16; gz <= 16; gz++) {
    const cx = CITY_C[0] + (gx - 0.5) * CELL.x;
    const cz = CITY_C[1] + gz * CELL.z;
    if (Math.hypot(cx - CITY_C[0], cz - CITY_C[1]) > CITY_R + 40) continue;
    if (!inSite(cx, cz, 20) && distToCanal(cx, cz) > 60) streetGeos.push(box(7, 0.1, CELL.z, cx, -0.2, cz, '#8b8e90'));
    const hx = CITY_C[0] + gx * CELL.x;
    const hz = CITY_C[1] + (gz - 0.5) * CELL.z;
    if (!inSite(hx, hz, 20) && distToCanal(hx, hz) > 60) streetGeos.push(box(CELL.x, 0.1, 7, hx, -0.19, hz, '#8b8e90'));
  }
}
scene.add(keep(colored(streetGeos, 'atrof_kochalar', { roughness: 1 })));
scene.add(keep(colored(cityGeos, 'atrof_uylar')));

// ---------- Kanal: suv, qirg'oq va sohil yo'lagi ----------
// O'q chizig'i bo'ylab lenta: har nuqtada ko'ndalang yo'nalish bo'yicha chap/o'ng siljish
const ribbon = (pts, offA, offB, y, hex) => {
  const pos = [];
  const idx = [];
  for (let i = 0; i < pts.length; i++) {
    const [px, pz] = pts[i];
    const [ax, az] = pts[Math.max(0, i - 1)];
    const [bx, bz] = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const [nx, nz] = [-(bz - az) / len, (bx - ax) / len]; // o'q chizig'iga ko'ndalang
    pos.push(px + nx * offA, y, pz + nz * offA, px + nx * offB, y, pz + nz * offB);
    if (i < pts.length - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2, k, k + 2, k + 1, k + 1, k + 2, k + 3); // ikki tomonlama
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return paint(g, hex);
};
// O'q chizig'ini silliqlash (Catmull-Rom) — burilishlar siniq ko'rinmasin
const smooth = new THREE.CatmullRomCurve3(CANAL.map(([x, z]) => new THREE.Vector3(x, 0, z))).getPoints(70).map((p) => [p.x, p.z]);
const canalGeos = [
  ribbon(smooth, -42, 42, 0.02, '#8fae84'), // qirg'oq maysasi
  ribbon(smooth, -30, 30, 0.06, '#b9b3a4'), // beton qirg'oq
  ribbon(smooth, -25, 25, 0.1, '#2f7f8a'), // suv
  ribbon(smooth, 33, 37, 0.14, '#d6d2c8'), // mavze tomondagi sohil yo'lagi
];
scene.add(keep(colored(canalGeos, 'kanal', { roughness: 0.55, metalness: 0.1 })));

// ---------- Mavze yeri: maysa, yo'llar, trotuar ----------
const groundGeos = [box(SITE.x1 - SITE.x0 + 150, 0.2, SITE.z1 - SITE.z0 + 40, (SITE.x0 + SITE.x1) / 2 - 40, -0.12, (SITE.z0 + SITE.z1) / 2, '#97ad88')];
const roadGeos = [];
const markGeos = [];
const ROAD = '#474c52';
// Katta yo'l (janubda) va sharqiy ko'cha
roadGeos.push(box(560, 0.3, 16, 20, 0.15, 116, ROAD));
groundGeos.push(box(560, 0.36, 2, 20, 0.18, 106.5, '#c9c5bb'), box(560, 0.36, 2, 20, 0.18, 125.5, '#c9c5bb'));
for (let x = -250; x < 290; x += 10) markGeos.push(box(3.4, 0.04, 0.25, x, 0.32, 116, '#e9e9e4'));
roadGeos.push(box(10, 0.3, 470, 232, 0.151, -110, ROAD));
// Ichki yo'llar: [x markaz, z markaz, x bo'yicha uzunlik, z bo'yicha uzunlik]
const INNER = [
  [10, 64, 270, 7], [-88, -5, 7, 140], [-36, 2, 6, 118], [12, -5, 6, 100], [10, -80, 270, 7], [118, -10, 7, 145],
  [150, -122, 7, 90], [105, -214, 250, 7], [105, -246, 250, 7], [75, -260, 6, 110], [140, -240, 6, 120],
];
for (const [x, z, lx, lz] of INNER) roadGeos.push(box(lx, 0.3, lz, x, 0.152, z, '#4d5258'));
// Bino atrofidagi trotuarlar
for (const s of SECTIONS) {
  const [fw, fd] = footprint(s);
  groundGeos.push(box(fw + 6, 0.34, fd + 6, s.x, 0.17, s.z, '#cfcbc1'));
}
// O'rtadagi bo'sh qum maydon
groundGeos.push(box(96, 0.3, 56, 6, 0.1, -128, '#c9a886'));
scene.add(keep(colored(groundGeos, 'yer', { roughness: 1 })));
scene.add(keep(colored(roadGeos, 'yollar', { roughness: 0.95 })));
scene.add(keep(colored(markGeos, 'yol_chiziqlari', { roughness: 0.8 })));

// Oq past binolar (maktab, bog'cha va h.k.) — blok emas, shuning uchun keep
const civic = [];
const CIVIC = [[-58, -108, 34, 6, 18], [-96, -128, 22, 5, 16], [78, -116, 26, 5, 14], [176, -120, 44, 7, 24], [190, 30, 46, 7, 30], [176, -40, 30, 5, 18], [-128, -90, 14, 4, 12]];
for (const [x, z, w, h, d] of CIVIC) {
  civic.push(box(w, h, d, x, h / 2, z, '#eef0f1'));
  civic.push(box(w * 0.6, 1.2, d * 0.6, x, h + 0.6, z, '#dfe3e6'));
  shadowGeos.push(shadowOf(x, z, w, d, h));
}
scene.add(keep(colored(civic, 'jamoat_binolari', { roughness: 0.9 })));

// ---------- Bloklar ----------
const glass = new THREE.MeshStandardMaterial({ color: '#27414f', roughness: 0.18, metalness: 0.55 });
const vitrageGlass = new THREE.MeshStandardMaterial({ color: '#6f9fb8', roughness: 0.12, metalness: 0.65 }); // vitrina va oyna devor
const carGeos = [];
const CAR = ['#e8e8e6', '#1f2328', '#9aa3ab', '#b3262b', '#2d4c7c', '#d9d4c7', '#5b6066'];

// Bitta seksiya: lokal koordinatada (uzun tomoni x bo'ylab) quriladi, keyin buriladi va joyiga ko'chiriladi.
// Qaytaradi: det — rangli detallar, win — deraza oynalari, vit — katta oyna yuzalar (vitrina, oyna devor).
const buildSection = (s) => {
  const st = ST[s.st];
  const { w, d } = s;
  const h = s.fl * FLOOR_H;
  const front = s.front ?? 1;
  const bays = Math.max(3, Math.round(w / 5.6));
  const bay = w / bays;
  const loggiaBays = bays >= 5 ? [1, bays - 2] : [1];
  const crownFrom = st.crown ? s.fl - 2 : s.fl; // shu qavatdan yuqorisi "toj"
  const out = (off) => d / 2 + off;
  const det = [];
  const win = [];
  const vit = [];
  const plane = (pw, ph, x, y, side, off, list = win) => {
    const g = new THREE.PlaneGeometry(pw, ph);
    if (side < 0) g.rotateY(Math.PI);
    g.translate(x, y, side * out(off));
    list.push(g);
  };

  det.push(box(w, h, d, 0, h / 2, 0, st.wall)); // devor
  det.push(box(w + 0.5, FLOOR_H + 0.3, d + 0.5, 0, (FLOOR_H + 0.3) / 2, 0, st.plinth)); // 1-qavat sokoli
  if (st.crown) det.push(box(w + 0.24, (s.fl - crownFrom) * FLOOR_H, d + 0.24, 0, crownFrom * FLOOR_H + (s.fl - crownFrom) * FLOOR_H / 2, 0, st.crown));
  // Karniz, parapet, tom va tomdagi qurilmalar (pentxaus, lift xonasi, ventilyatsiya)
  det.push(box(w + 1.1, 0.35, d + 1.1, 0, h + 0.1, 0, st.slab));
  det.push(box(w + 0.5, 1.0, d + 0.5, 0, h + 0.7, 0, st.crown ?? st.accent));
  det.push(box(w - 0.6, 0.25, d - 0.6, 0, h + 1.15, 0, '#7b787d'));
  det.push(box(w * 0.42, 2.9, d * 0.5, -w * 0.12, h + 2.6, 0, st.wall));
  det.push(box(w * 0.42 + 0.6, 0.3, d * 0.5 + 0.6, -w * 0.12, h + 4.15, 0, '#6a676c'));
  det.push(box(3.2, 2.2, 3.2, w * 0.32, h + 2.2, d * 0.12, '#c9cbc9'));
  det.push(box(1.4, 0.9, 1.4, w * 0.18, h + 1.6, -d * 0.22, '#9a9da0'));

  if (st.band) { // qavatlararo gorizontal chiziqlar
    for (let f = 2; f <= crownFrom; f++) det.push(box(w + 0.34, 0.24, d + 0.34, 0, f * FLOOR_H, 0, st.band));
  }
  for (let k = 0; k <= bays; k++) { // tik pilyastrlar, ikkala fasadda (toj qavatlargacha)
    const ph = crownFrom * FLOOR_H - FLOOR_H;
    for (const side of [1, -1]) det.push(box(0.6, ph, 0.44, -w / 2 + k * bay, FLOOR_H + ph / 2, side * out(0.22), st.accent));
  }
  if (st.stripe) { // derazalar ortidagi tik to'q tasmalar
    for (let k = 0; k < bays; k++) {
      for (const side of [1, -1]) det.push(box(Math.min(3.9, bay - 1.3), h - FLOOR_H - 0.8, 0.12, -w / 2 + (k + 0.5) * bay, FLOOR_H + (h - FLOOR_H - 0.8) / 2 + 0.2, side * out(0.06), st.stripe));
    }
  }

  // Balkonlar: plita + panjara + yon to'siqlar
  for (let f = 1; f < s.fl; f++) {
    const y = f * FLOOR_H;
    for (const k of loggiaBays) {
      const bx = -w / 2 + (k + 0.5) * bay;
      const bw = bay - 0.8;
      det.push(box(bw, 0.2, 1.5, bx, y + 0.1, front * out(0.75), st.slab));
      det.push(box(bw, 1.0, 0.1, bx, y + 0.7, front * out(1.45), st.rail));
      det.push(box(0.1, 1.0, 1.5, bx - bw / 2, y + 0.7, front * out(0.75), st.rail));
      det.push(box(0.1, 1.0, 1.5, bx + bw / 2, y + 0.7, front * out(0.75), st.rail));
    }
  }
  // Kirish ayvonlari (hovli tomonda)
  for (const k of loggiaBays) {
    const ex = -w / 2 + (k + 0.5) * bay;
    det.push(box(bay - 0.8, 0.3, 2.8, ex, 3.2, -front * out(1.4), st.slab));
    det.push(box(0.25, 3.0, 0.25, ex - bay / 2 + 0.7, 1.5, -front * out(2.5), st.accent));
    det.push(box(0.25, 3.0, 0.25, ex + bay / 2 - 0.7, 1.5, -front * out(2.5), st.accent));
  }

  const wOff = st.stripe ? 0.14 : 0.03;
  for (let f = 0; f < s.fl; f++) {
    const y = f * FLOOR_H + FLOOR_H / 2 + 0.2;
    const inCrown = f >= crownFrom;
    for (let k = 0; k < bays; k++) {
      const x = -w / 2 + (k + 0.5) * bay;
      for (const side of [1, -1]) {
        if (f === 0 && s.shop && side === front) { plane(bay - 0.9, 2.5, x, 1.55, side, 0.29, vit); continue; } // vitrina
        if (st.curtain && side === front && f > 0) continue; // oyna devor pastda alohida qo'yiladi
        const balcony = side === front && loggiaBays.includes(k) && f > 0;
        const ww = Math.min(balcony ? bay - 1.6 : 3.3, bay - 1.5);
        const off = inCrown ? 0.15 : wOff;
        plane(ww, balcony ? 2.2 : 1.7, x, balcony ? y - 0.25 : y, side, off);
        if (st.arches && f === s.fl - 1) { // arkali deraza tepasi
          const a = new THREE.CircleGeometry(ww / 2, 8, 0, Math.PI);
          if (side < 0) a.rotateY(Math.PI);
          a.translate(x, y + (balcony ? 0.85 : 0.85), side * out(off));
          win.push(a);
        }
      }
    }
    for (const side of [1, -1]) { // yon devorlarda derazalar
      for (const dz of d > 15 ? [-d / 4, d / 4] : [0]) {
        const g = new THREE.PlaneGeometry(2.4, 1.7);
        g.rotateY(side * Math.PI / 2);
        g.translate(side * (w / 2 + (inCrown ? 0.15 : 0.03)), y, dz);
        win.push(g);
      }
    }
  }
  if (st.curtain) { // oyna devor: old fasad va bir yon tomon, oq impostlar bilan
    plane(w - 1.6, h - FLOOR_H - 0.6, 0, FLOOR_H + (h - FLOOR_H - 0.6) / 2 + 0.2, front, 0.1, vit);
    for (let k = 1; k < bays; k++) det.push(box(0.22, h - FLOOR_H, 0.3, -w / 2 + k * bay, FLOOR_H + (h - FLOOR_H) / 2, front * out(0.15), '#ffffff'));
    const g = new THREE.PlaneGeometry(d - 1.6, h - FLOOR_H - 0.6);
    g.rotateY(-Math.PI / 2);
    g.translate(-(w / 2 + 0.1), FLOOR_H + (h - FLOOR_H - 0.6) / 2 + 0.2, 0);
    vit.push(g);
  }

  const m = new THREE.Matrix4().makeRotationY(s.rot === 90 ? Math.PI / 2 : 0).setPosition(s.x, 0, s.z);
  for (const g of [...det, ...win, ...vit]) g.applyMatrix4(m);
  return { det, win, vit, h };
};

const blocks = new Map(); // blok raqami -> { det, win, vit, sections }
for (const s of SECTIONS) {
  if (s.z > 80 && !s.rot) s.shop = true; // katta yo'lga qaragan old qator: 1-qavat vitrinalar
  const part = buildSection(s);
  const b = blocks.get(s.b) ?? { det: [], win: [], vit: [], sections: [] };
  b.det.push(...part.det);
  b.win.push(...part.win);
  b.vit.push(...part.vit);
  b.sections.push({ ...s, h: part.h });
  blocks.set(s.b, b);
  const [fw, fd] = footprint(s);
  shadowGeos.push(shadowOf(s.x, s.z, fw, fd, part.h));
}
const layout = {};
for (const [n, b] of [...blocks].sort((a, c) => a[0] - c[0])) {
  const group = new THREE.Group();
  group.name = `blok_${n}`;
  group.add(colored(b.det, `blok_${n}_detal`, { roughness: 0.85 }));
  const windows = new THREE.Mesh(mergeGeometries(b.win), glass);
  windows.name = `blok_${n}_oyna`;
  group.add(windows);
  if (b.vit.length) {
    const vitrage = new THREE.Mesh(mergeGeometries(b.vit), vitrageGlass);
    vitrage.name = `blok_${n}_vitraj`;
    group.add(vitrage);
  }
  scene.add(group);

  if (n > 11) continue; // keyingi navbat bloklariga pin yo'q
  // Pin — blokning o'rtasiga eng yaqin seksiya tomida; kamera janubi-sharqdan, blok kattaligiga mos masofada
  const cx = b.sections.reduce((a, s) => a + s.x, 0) / b.sections.length;
  const cz = b.sections.reduce((a, s) => a + s.z, 0) / b.sections.length;
  const main = b.sections.reduce((best, s) => (Math.hypot(s.x - cx, s.z - cz) < Math.hypot(best.x - cx, best.z - cz) ? s : best));
  const hMax = Math.max(...b.sections.map((s) => s.h));
  const ext = Math.max(...b.sections.map((s) => Math.hypot(s.x - cx, s.z - cz) + s.w / 2));
  const k = Math.max(1, ext / 32);
  const r1 = (v) => Math.round(v * 10) / 10;
  layout[n] = {
    pin: [r1(main.x), r1(main.h + 5), r1(main.z)],
    cam: [r1(cx + 38 * k), r1(hMax + 42 * k), r1(cz + 66 * k)],
  };
}

// ---------- Mashinalar: ichki yo'llar chetida ----------
for (const [x, z, lx, lz] of INNER) {
  const alongX = lx > lz;
  const len = alongX ? lx : lz;
  for (let t = -len / 2 + 4; t < len / 2 - 4; t += 3.2) {
    if (rnd() < 0.62) continue;
    const cx = alongX ? x + t : x + (rnd() < 0.5 ? -5.2 : 5.2);
    const cz = alongX ? z + (rnd() < 0.5 ? -5.4 : 5.4) : z + t;
    if (onBuilding(cx, cz, 1.5)) continue;
    const c = pick(CAR);
    carGeos.push(alongX ? box(2.0, 0.75, 4.3, cx, 0.72, cz, c) : box(4.3, 0.75, 2.0, cx, 0.72, cz, c));
    carGeos.push(alongX ? box(1.8, 0.6, 2.2, cx, 1.38, cz, '#1c2227') : box(2.2, 0.6, 1.8, cx, 1.38, cz, '#1c2227'));
  }
}
scene.add(keep(colored(carGeos, 'mashinalar', { roughness: 0.45, metalness: 0.3 })));

// ---------- Daraxtlar ----------
const trunkGeos = [];
const leafGeos = [];
const LEAF = ['#3f7d4a', '#4f8f5a', '#5c9a55', '#467f3f', '#6aa35f'];
const onRoad = (x, z) => INNER.some(([rx, rz, lx, lz]) => Math.abs(x - rx) < lx / 2 + 2 && Math.abs(z - rz) < lz / 2 + 2);
const tree = (x, z) => {
  if (onBuilding(x, z) || onRoad(x, z) || distToCanal(x, z) < 34) return;
  const s = 0.75 + rnd() * 0.7;
  const t = new THREE.CylinderGeometry(0.28 * s, 0.4 * s, 2.6 * s, 4, 1, true);
  t.translate(x, 1.3 * s + 0.3, z);
  trunkGeos.push(paint(t, '#6b4f3a'));
  const l = new THREE.IcosahedronGeometry(2.1 * s, 0);
  l.scale(1, 1.15, 1);
  l.translate(x, 4.2 * s + 0.3, z);
  leafGeos.push(paint(l, pick(LEAF)));
  shadowGeos.push(shadowOf(x, z, 2.6 * s, 2.6 * s, 5.2 * s));
};
for (let x = -240; x < 290; x += 8.5) { tree(x + rnd() * 2, 103.5); tree(x + 4 + rnd() * 2, 128.5); } // katta yo'l bo'ylab ikki qator
for (let n = 0; n < 230; n++) { // hovlilar va maysazorlar
  const x = SITE.x0 + 20 + rnd() * (SITE.x1 - SITE.x0 - 40);
  const z = SITE.z0 + 15 + rnd() * (SITE.z1 - SITE.z0 - 55);
  if (Math.abs(x - 6) < 50 && Math.abs(z + 128) < 30) continue; // qum maydon
  tree(x, z);
}
for (let i = 4; i < smooth.length - 18; i += 2) { // kanal sohili bo'ylab
  const [px, pz] = smooth[i];
  const [qx, qz] = smooth[i + 1];
  const len = Math.hypot(qx - px, qz - pz) || 1;
  tree(px - (qz - pz) / len * 40 + rnd(), pz + (qx - px) / len * 40 + rnd());
}
scene.add(keep(colored(trunkGeos, 'daraxt_tana', { roughness: 1 })));
scene.add(keep(colored(leafGeos, 'daraxt_barg', { roughness: 1 })));

// ---------- Pishirilgan soyalar ----------
const shadows = new THREE.Mesh(
  mergeGeometries(shadowGeos),
  new THREE.MeshBasicMaterial({ color: '#16242b', transparent: true, opacity: 0.26, depthWrite: false }),
);
shadows.name = 'soyalar';
shadows.renderOrder = 1;
scene.add(keep(shadows));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, { binary: true });
const out = join(root, 'public', '3d', 'placeholder.glb');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(glb));
writeFileSync(join(root, 'src', 'lib', 'placeholderLayout.json'), `${JSON.stringify(layout, null, 2)}\n`);
console.log(`Yozildi: ${out} (${(glb.byteLength / 1024).toFixed(0)} KB, ${blocks.size} blok, ${SECTIONS.length} seksiya)`);
console.log(`Pinlar: ${Object.keys(layout).join(', ')}`);
