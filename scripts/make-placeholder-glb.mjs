/*
  Placeholder mavze modeli: public/3d/placeholder.glb
  Haqiqiy 3D model (arxitektordan) kelguncha sahna shu bilan ishlaydi. Rahbar bergan render
  skrinshotiga o'xshash: panjara shaklida 28 ta 9–12 qavatli blok, yo'l tarmog'i, daraxtlar, stadion.

  Ishga tushirish:  node scripts/make-placeholder-glb.mjs

  Nomlash qoidasi (haqiqiy .glb ham shunga amal qilsin):
  • Har bino meshi `blok_<n>` — scene_pins.mesh_name shu nom bilan bog'lanadi.
  • Qolgan meshlar (yer, yo'l, daraxt, derazalar) userData.keep = true — sayt ularning materialini
    o'zgartirmaydi; keep bo'lmagan meshlarga sayt o'zi rang beradi (sotuvdagi bloklar teal, qolganlari kulrang).

  Panjara konstantalari src/lib/db.ts dagi PLACEHOLDER_GRID bilan BIR XIL bo'lishi shart —
  seed pinlar va kamera nuqtalari o'sha yerda hisoblanadi.
*/
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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

const scene = new THREE.Scene();
scene.name = 'voha_placeholder';

const keep = (mesh) => { mesh.userData.keep = true; return mesh; };
const add = (mesh) => { scene.add(mesh); return mesh; };

// Yer
const groundW = GRID.cols * GRID.stepX + 120;
const groundD = GRID.rows * GRID.stepZ + 160;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(groundW, groundD),
  new THREE.MeshStandardMaterial({ color: '#b7c7bb', roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.name = 'yer';
add(keep(ground));

// Yo'llar: qatorlar orasida (x bo'ylab) va ustunlar orasida (z bo'ylab) — bitta meshga birlashtiriladi
const roadGeos = [];
const roadLenX = GRID.cols * GRID.stepX + 40;
const roadLenZ = GRID.rows * GRID.stepZ + 40;
for (let r = 0; r <= GRID.rows; r++) {
  const z = (r - GRID.rows / 2) * GRID.stepZ;
  const g = new THREE.BoxGeometry(roadLenX, 0.3, 8);
  g.translate(0, 0.15, z);
  roadGeos.push(g);
}
for (let c = 0; c <= GRID.cols; c++) {
  const x = (c - GRID.cols / 2) * GRID.stepX;
  const g = new THREE.BoxGeometry(6, 0.3, roadLenZ);
  g.translate(x, 0.15, 0);
  roadGeos.push(g);
}
const roads = new THREE.Mesh(mergeGeometries(roadGeos), new THREE.MeshStandardMaterial({ color: '#4b5056', roughness: 0.95 }));
roads.name = 'yollar';
add(keep(roads));

// Bloklar + derazalar (derazalar bitta merged mesh — telefon uchun kam draw call)
const windowGeos = [];
const floorsOf = (i) => 9 + ((i * 7) % 4); // = db.ts placeholderBlock
for (let i = 0; i < GRID.cols * GRID.rows; i++) {
  const col = i % GRID.cols;
  const row = Math.floor(i / GRID.cols);
  const floors = floorsOf(i);
  const h = floors * GRID.floorH;
  const x = (col - (GRID.cols - 1) / 2) * GRID.stepX;
  const z = (row - (GRID.rows - 1) / 2) * GRID.stepZ;

  const block = new THREE.Mesh(
    new THREE.BoxGeometry(GRID.w, h, GRID.d),
    new THREE.MeshStandardMaterial({ color: '#d7d9dc', roughness: 0.9 }),
  );
  block.position.set(x, h / 2, z);
  block.name = `blok_${i + 1}`;
  add(block);

  // Uzun tomonlarda har qavatga 6 ta deraza (ikkala tomon)
  for (let f = 0; f < floors; f++) {
    const y = f * GRID.floorH + GRID.floorH / 2;
    for (let k = 0; k < 6; k++) {
      const wx = x - GRID.w / 2 + (k + 0.5) * (GRID.w / 6);
      for (const side of [1, -1]) {
        const g = new THREE.PlaneGeometry(3, 1.6);
        if (side < 0) g.rotateY(Math.PI);
        g.translate(wx, y, z + side * (GRID.d / 2 + 0.03));
        windowGeos.push(g);
      }
    }
  }
}
const windows = new THREE.Mesh(
  mergeGeometries(windowGeos),
  new THREE.MeshStandardMaterial({ color: '#1f3a44', roughness: 0.3, metalness: 0.2 }),
);
windows.name = 'derazalar';
add(keep(windows));

// Daraxtlar: yo'l bo'ylab, tana va barg alohida ikki merged mesh
const trunkGeos = [];
const leafGeos = [];
const tree = (x, z) => {
  const t = new THREE.CylinderGeometry(0.35, 0.45, 2.5, 6);
  t.translate(x, 1.25, z);
  trunkGeos.push(t);
  const l = new THREE.SphereGeometry(2.2, 8, 6);
  l.translate(x, 4.2, z);
  leafGeos.push(l);
};
for (let r = 0; r <= GRID.rows; r++) {
  const z = (r - GRID.rows / 2) * GRID.stepZ;
  for (let x = -roadLenX / 2 + 10; x < roadLenX / 2; x += 23) {
    tree(x, z + 6.5);
    tree(x + 11, z - 6.5);
  }
}
const trunks = new THREE.Mesh(mergeGeometries(trunkGeos), new THREE.MeshStandardMaterial({ color: '#6b4f3a', roughness: 1 }));
trunks.name = 'daraxt_tana';
add(keep(trunks));
const leaves = new THREE.Mesh(mergeGeometries(leafGeos), new THREE.MeshStandardMaterial({ color: '#4f8f5a', roughness: 1 }));
leaves.name = 'daraxt_barg';
add(keep(leaves));

// Stadion (renderdagi kabi mavze chetida)
const stadium = new THREE.Mesh(new THREE.BoxGeometry(70, 0.4, 45), new THREE.MeshStandardMaterial({ color: '#3f8a5c', roughness: 1 }));
stadium.position.set(-GRID.stepX * 2, 0.2, GRID.rows / 2 * GRID.stepZ + 40);
stadium.name = 'stadion';
add(keep(stadium));
const track = new THREE.Mesh(new THREE.BoxGeometry(80, 0.3, 55), new THREE.MeshStandardMaterial({ color: '#b85c4a', roughness: 1 }));
track.position.set(stadium.position.x, 0.1, stadium.position.z);
track.name = 'stadion_yugurish';
add(keep(track));

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, { binary: true });
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', '3d', 'placeholder.glb');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(glb));
console.log(`Yozildi: ${out} (${(glb.byteLength / 1024).toFixed(0)} KB, ${GRID.cols * GRID.rows} blok)`);
