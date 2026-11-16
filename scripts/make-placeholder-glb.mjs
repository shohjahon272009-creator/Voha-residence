/*
  Placeholder mavze modeli: public/3d/placeholder.glb
  Haqiqiy 3D model (arxitektordan) kelguncha sahna shu bilan ishlaydi. Rahbar bergan render
  skrinshotiga o'xshash: panjara shaklida 28 ta 9–12 qavatli blok, yo'l tarmog'i, trotuar, mashinalar,
  daraxtlar, stadion va atrofdagi past qavatli shahar.

  Ishga tushirish:  node scripts/make-placeholder-glb.mjs

  Nomlash qoidasi (haqiqiy .glb ham shunga amal qilsin):
  • Har bino — `blok_<n>` nomli guruh (ichida devor, detal, oyna meshlari). scene_pins.mesh_name shu nom.
  • Bino bo'lmagan hamma narsa (yer, yo'l, soya, daraxt, mashina, atrof) userData.keep = true —
    sayt ularning materialiga tegmaydi va ularni "bino" deb hisoblamaydi.

  Soyalar real vaqtda hisoblanmaydi (telefon uchun og'ir): quyosh yo'nalishi bo'yicha yerga
  "pishirilgan" yarim shaffof shakllar. SUN src/components/website/Scene3D.tsx dagi bilan bir xil.

  Panjara konstantalari src/lib/db.ts dagi PLACEHOLDER_GRID bilan BIR XIL bo'lishi shart —
  seed pinlar va kamera nuqtalari o'sha yerda hisoblanadi.
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

const GRID = { cols: 7, rows: 4, stepX: 46, stepZ: 36, w: 34, d: 14, floorH: 3 }; // = db.ts PLACEHOLDER_GRID
const SUN = [-110, 190, -150]; // = Scene3D.tsx SUN (kamera tomondan — ko'rinadigan fasadlar yorug')
const BAYS = 6;

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
const box = (w, h, d, x, y, z, hex, bottom = false) => {
  const [a, b, c] = [w / 2, h / 2, d / 2];
  const p = [-a, -b, c, a, -b, c, a, -b, -c, -a, -b, -c, -a, b, c, a, b, c, a, b, -c, -a, b, -c];
  for (let i = 0; i < 24; i += 3) { p[i] += x; p[i + 1] += y; p[i + 2] += z; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setIndex(bottom ? BOX_INDEX : BOX_INDEX.slice(6));
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

const groundW = GRID.cols * GRID.stepX + 120;
const groundD = GRID.rows * GRID.stepZ + 160;
const roadLenX = GRID.cols * GRID.stepX + 40;
const roadLenZ = GRID.rows * GRID.stepZ + 40;

// --- Atrof: ufqgacha yer va past qavatli shahar ---
const far = new THREE.Mesh(new THREE.CircleGeometry(2600, 48), new THREE.MeshStandardMaterial({ color: '#a7af98', roughness: 1 }));
far.rotation.x = -Math.PI / 2;
far.position.y = -0.3;
far.name = 'atrof_yer';
scene.add(keep(far));

// Shahar: ko'cha panjarasi, har kvartalda past uylar, ba'zisida 5 qavatli panel uy. Uy soyalari ham pishiriladi.
const cityGeos = [];
const streetGeos = [];
const cityShadowGeos = [];
const HOUSE = ['#ddd6c8', '#d2cbbd', '#c9ced1', '#e4dfd3', '#c2bbae', '#d8d2c4'];
const ROOF = ['#9a5f4c', '#84766b', '#74828b', '#a8735b', '#6d6a66', '#8f4f42'];
const FIELD = ['#a3b09a', '#b4bba3', '#9fae93', '#b9b59c', '#a9b7a4'];
const CELL = { x: 62, z: 52 };
const CITY_R = 700;
const cityHouses = [];
for (let gx = -12; gx <= 12; gx++) {
  for (let gz = -14; gz <= 14; gz++) {
    const cx = gx * CELL.x;
    const cz = gz * CELL.z;
    const dist = Math.hypot(cx, cz * 1.15);
    if (dist > CITY_R) continue;
    if (Math.abs(cx) < groundW / 2 + CELL.x / 2 && Math.abs(cz) < groundD / 2 + CELL.z / 2) continue;
    const kind = rnd();
    if (kind < 0.08) { cityGeos.push(box(CELL.x - 12, 0.12, CELL.z - 12, cx, 0.02, cz, pick(FIELD))); continue; } // bo'sh maydon / bog'
    if (kind < 0.2) { // 5 qavatli panel uy
      const w = 40, d = 12, h = 15 + Math.floor(rnd() * 3) * 3;
      cityHouses.push([cx, cz + (rnd() - 0.5) * 10, w, d, h, pick(HOUSE), '#55595e']);
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
}
for (let gx = -12; gx <= 13; gx++) streetGeos.push(box(7, 0.1, CITY_R * 2.1, (gx - 0.5) * CELL.x, -0.2, 0, '#8b8e90'));
for (let gz = -14; gz <= 15; gz++) streetGeos.push(box(CITY_R * 2.3, 0.1, 7, 0, -0.19, (gz - 0.5) * CELL.z, '#8b8e90'));
scene.add(keep(colored(streetGeos, 'atrof_kochalar', { roughness: 1 })));
scene.add(keep(colored(cityGeos, 'atrof_uylar')));

// --- Mavze yeri: maysa, trotuar, yo'l, chiziqlar ---
const groundGeos = [box(groundW, 0.2, groundD, 0, -0.1, 0, '#97ad88')];
const roadGeos = [];
const markGeos = [];
for (let r = 0; r <= GRID.rows; r++) {
  const z = (r - GRID.rows / 2) * GRID.stepZ;
  roadGeos.push(box(roadLenX, 0.3, 8, 0, 0.15, z, '#474c52'));
  groundGeos.push(box(roadLenX, 0.36, 1.6, 0, 0.18, z + 4.8, '#c9c5bb'));
  groundGeos.push(box(roadLenX, 0.36, 1.6, 0, 0.18, z - 4.8, '#c9c5bb'));
  for (let x = -roadLenX / 2 + 4; x < roadLenX / 2 - 4; x += 10) markGeos.push(box(3, 0.04, 0.22, x, 0.32, z, '#e9e9e4'));
}
for (let c = 0; c <= GRID.cols; c++) {
  const x = (c - GRID.cols / 2) * GRID.stepX;
  roadGeos.push(box(6, 0.3, roadLenZ, x, 0.151, 0, '#4d5258'));
}
scene.add(keep(colored(groundGeos, 'yer', { roughness: 1 })));
scene.add(keep(colored(roadGeos, 'yollar', { roughness: 0.95 })));
scene.add(keep(colored(markGeos, 'yol_chiziqlari', { roughness: 0.8 })));

// --- Bloklar ---
const STYLES = [
  { wall: '#ebe7df', accent: '#8a6a4f', loggia: '#d9cbb8', plinth: '#6e6259' }, // oq + jigarrang
  { wall: '#e1e5e8', accent: '#46535c', loggia: '#c9d1d6', plinth: '#565d63' }, // sovuq kulrang
  { wall: '#f0e7d4', accent: '#b98a5e', loggia: '#e3d2b6', plinth: '#74624f' }, // qum rang + bronza
];
const glass = new THREE.MeshStandardMaterial({ color: '#27414f', roughness: 0.18, metalness: 0.55 });
const shadowGeos = [];
const padGeos = [];
const carGeos = [];
const CAR = ['#e8e8e6', '#1f2328', '#9aa3ab', '#b3262b', '#2d4c7c', '#d9d4c7', '#5b6066'];
const [sx, sy, sz] = SUN;
const shadowDir = [-sx / sy, -sz / sy]; // balandlik birligiga soya siljishi

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
const shadowOf = (x, z, w, d, h, y = 0.4) => {
  const [ox, oz] = [shadowDir[0] * h, shadowDir[1] * h];
  const base = [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]];
  const hp = hull(base.concat(base.map(([a, b]) => [a + ox, b + oz])));
  const pos = [];
  for (let i = 1; i < hp.length - 1; i++) {
    // yuqoriga qaragan uchburchak (soat miliga teskari, yuqoridan qaraganda)
    pos.push(hp[0][0], y, hp[0][1], hp[i + 1][0], y, hp[i + 1][1], hp[i][0], y, hp[i][1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
};

const floorsOf = (i) => 9 + ((i * 7) % 4); // = db.ts placeholderBlock
for (let i = 0; i < GRID.cols * GRID.rows; i++) {
  const col = i % GRID.cols;
  const row = Math.floor(i / GRID.cols);
  const floors = floorsOf(i);
  const h = floors * GRID.floorH;
  const x = (col - (GRID.cols - 1) / 2) * GRID.stepX;
  const z = (row - (GRID.rows - 1) / 2) * GRID.stepZ;
  const st = STYLES[(col + row * 2) % STYLES.length];
  const { w, d, floorH } = GRID;
  const front = row < GRID.rows / 2 ? -1 : 1; // lodjiyalar mavzening tashqi tomoniga qaraydi
  const bay = w / BAYS;

  const group = new THREE.Group();
  group.name = `blok_${i + 1}`;

  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: st.wall, roughness: 0.92 }));
  wall.position.set(x, h / 2, z);
  wall.name = `blok_${i + 1}_devor`;
  group.add(wall);

  const det = [];
  det.push(box(w + 0.5, floorH + 0.2, d + 0.5, x, (floorH + 0.2) / 2, z, st.plinth)); // 1-qavat sokoli
  det.push(box(w + 0.6, 0.9, d + 0.6, x, h + 0.2, z, st.accent)); // parapet
  det.push(box(w - 0.8, 0.3, d - 0.8, x, h + 0.75, z, '#3b4046')); // tom
  det.push(box(5, 2.6, 4.5, x - w / 4, h + 2, z, '#c9cbc9')); // lift xonalari
  det.push(box(5, 2.6, 4.5, x + w / 4, h + 2, z, '#c9cbc9'));
  for (let k = 0; k <= BAYS; k++) { // tik pilyastrlar, ikkala fasadda
    const px = x - w / 2 + k * bay;
    for (const s of [1, -1]) det.push(box(0.55, h - floorH, 0.4, px, floorH + (h - floorH) / 2, z + s * (d / 2 + 0.2), st.accent));
  }
  for (let f = 1; f < floors; f++) { // lodjiyalar: old fasadda ikki qator
    const y = f * floorH + 0.75;
    for (const k of [1, 4]) det.push(box(bay - 0.9, 1.3, 1.5, x - w / 2 + (k + 0.5) * bay, y, z + front * (d / 2 + 0.75), st.loggia));
  }
  for (const k of [1, 4]) { // kirish ayvonlari
    det.push(box(bay - 1, 0.3, 2.6, x - w / 2 + (k + 0.5) * bay, 3.1, z - front * (d / 2 + 1.3), st.accent));
  }
  const detail = colored(det, `blok_${i + 1}_detal`, { roughness: 0.85 });
  group.add(detail);

  const win = [];
  for (let f = 0; f < floors; f++) {
    const y = f * floorH + floorH / 2 + 0.15;
    for (let k = 0; k < BAYS; k++) {
      const wx = x - w / 2 + (k + 0.5) * bay;
      for (const s of [1, -1]) {
        const loggia = s === front && (k === 1 || k === 4) && f > 0;
        const g = new THREE.PlaneGeometry(loggia ? bay - 1.4 : 3.4, loggia ? 1.2 : 1.7);
        if (s < 0) g.rotateY(Math.PI);
        g.translate(wx, loggia ? y + 0.75 : y, z + s * (d / 2 + (loggia ? 1.52 : 0.03)));
        win.push(g);
      }
    }
    for (const s of [1, -1]) { // yon devorlarda bittadan deraza
      const g = new THREE.PlaneGeometry(2.4, 1.7);
      g.rotateY(s * Math.PI / 2);
      g.translate(x + s * (w / 2 + 0.03), y, z);
      win.push(g);
    }
  }
  const windows = new THREE.Mesh(mergeGeometries(win), glass);
  windows.name = `blok_${i + 1}_oyna`;
  group.add(windows);
  scene.add(group);

  shadowGeos.push(shadowOf(x, z, w, d, h));
  padGeos.push(box(w + 7, 0.34, d + 8, x, 0.17, z, '#cfcbc1')); // bino atrofidagi trotuar
  // To'xtab turgan mashinalar: bino orqa tomonidagi yo'l chetida
  for (let cx = x - w / 2 + 2; cx < x + w / 2 - 2; cx += 3.1) {
    if (rnd() < 0.45) continue;
    const cz = z - front * (d / 2 + 6.2);
    const c = pick(CAR);
    carGeos.push(box(2.0, 0.75, 4.3, cx, 0.72, cz, c));
    carGeos.push(box(1.8, 0.6, 2.2, cx, 1.38, cz - 0.2, '#1c2227'));
  }
}
for (const [x, z, w, d, h] of cityHouses) shadowGeos.push(shadowOf(x, z, w, d, h, -0.1));
scene.add(keep(colored(padGeos, 'trotuar', { roughness: 1 })));
scene.add(keep(colored(carGeos, 'mashinalar', { roughness: 0.45, metalness: 0.3 })));

// --- Daraxtlar: yo'l bo'ylab va hovlilarda, har xil o'lcham va yashil tuslar ---
const trunkGeos = [];
const leafGeos = [];
const LEAF = ['#3f7d4a', '#4f8f5a', '#5c9a55', '#467f3f', '#6aa35f'];
const tree = (x, z) => {
  const s = 0.75 + rnd() * 0.7;
  const t = new THREE.CylinderGeometry(0.28 * s, 0.4 * s, 2.6 * s, 4, 1, true);
  t.translate(x, 1.3 * s + 0.3, z);
  trunkGeos.push(paint(t, '#6b4f3a'));
  const c = pick(LEAF);
  const l = new THREE.IcosahedronGeometry(2.1 * s, 0);
  l.scale(1, 1.15, 1);
  l.translate(x, 4.2 * s + 0.3, z);
  leafGeos.push(paint(l, c));
  shadowGeos.push(shadowOf(x, z, 2.6 * s, 2.6 * s, 5.2 * s));
};
for (let r = 0; r <= GRID.rows; r++) {
  const z = (r - GRID.rows / 2) * GRID.stepZ;
  for (let x = -roadLenX / 2 + 8; x < roadLenX / 2 - 4; x += 15) {
    tree(x + rnd() * 2, z + 6.4);
    tree(x + 7.5 + rnd() * 2, z - 6.4);
  }
}
for (let n = 0; n < 45; n++) { // mavze chetidagi maysada
  const side = rnd() < 0.5 ? -1 : 1;
  const alongX = rnd() < 0.6;
  const x = alongX ? (rnd() - 0.5) * (groundW - 20) : side * (roadLenX / 2 + 8 + rnd() * 28);
  const z = alongX ? side * (roadLenZ / 2 + 8 + rnd() * 50) : (rnd() - 0.5) * (groundD - 20);
  tree(x, z);
}
scene.add(keep(colored(trunkGeos, 'daraxt_tana', { roughness: 1 })));
scene.add(keep(colored(leafGeos, 'daraxt_barg', { roughness: 1 })));

// --- Stadion (renderdagi kabi mavze chetida) ---
const stX = -GRID.stepX * 2;
const stZ = (GRID.rows / 2) * GRID.stepZ + 42;
const stGeos = [
  box(80, 0.3, 54, stX, 0.16, stZ, '#b5604d'),
  box(68, 0.34, 42, stX, 0.18, stZ, '#3f8f5c'),
  box(0.3, 0.36, 42, stX, 0.19, stZ, '#e6efe6'),
  box(68, 0.36, 0.3, stX, 0.19, stZ - 21, '#e6efe6'),
  box(68, 0.36, 0.3, stX, 0.19, stZ + 21, '#e6efe6'),
  box(30, 2.4, 3, stX, 1.2, stZ + 30, '#c4c7c9'), // tribuna
];
scene.add(keep(colored(stGeos, 'stadion', { roughness: 1 })));

// --- Pishirilgan soyalar ---
const shadows = new THREE.Mesh(
  mergeGeometries(shadowGeos),
  new THREE.MeshBasicMaterial({ color: '#16242b', transparent: true, opacity: 0.26, depthWrite: false }),
);
shadows.name = 'soyalar';
shadows.renderOrder = 1;
scene.add(keep(shadows));

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, { binary: true });
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', '3d', 'placeholder.glb');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(glb));
console.log(`Yozildi: ${out} (${(glb.byteLength / 1024).toFixed(0)} KB, ${GRID.cols * GRID.rows} blok)`);
