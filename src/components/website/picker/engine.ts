// Konsept 3D sahna (oddiy three.js). Faqat dinamik import() orqali yuklanadi.
// Kadr faqat kerak bo'lganda chiziladi: kamera/tanlov o'zgarganda; harakatsiz — sikl to'xtaydi.
import {
  BoxGeometry, CanvasTexture, Color, DirectionalLight, EdgesGeometry, Group, HemisphereLight,
  LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial, Object3D, PerspectiveCamera,
  PlaneGeometry, Raycaster, Scene, SRGBColorSpace, Sprite, SpriteMaterial, Vector2, Vector3, WebGLRenderer,
} from 'three';
import type { StatusKind } from './data';

export interface EngineApt { id: number; number: string; status: StatusKind }
export interface EngineFloor { floor: number; total: number; available: number; apts: EngineApt[] }
export interface EngineBlock { id: number; label: string; maxFloor: number; floors: EngineFloor[] }
export interface EngineSel { pid: number | null; floor: number | null; aid: number | null }
export interface EnginePick { pid: number; floor: number | null; aid: number | null }
export interface EngineOpts {
  blocks: EngineBlock[];
  reducedMotion: boolean;
  onPick: (p: EnginePick) => void;
  onLost: () => void;
}
export interface Engine { update: (s: EngineSel) => void; dispose: () => void }

// O'lchamlar (shartli birlik)
const W = 10, D = 7, H = 1, SLAB = 0.86, GAP = 16, PER_ROW = 4, MAX_FLOORS = 40;
const C_BG = '#F4EFE4', C_GROUND = '#E7DFCF', C_EMPTY = '#D9D2C4', C_SOLD = '#B4BAC3', C_FREE = '#2E9A63';
const C_CELL: Record<StatusKind, string> = { available: '#2E9A63', reserved: '#D9A441', sold: '#A3AAB4' };
const C_SEL = '#D18E5B';
const C_HOVER = '#3B2A1B'; // ustiga kelganda yengil yoritish (emissive)
const DUR = 400;
// Blok yorlig'i: majmua ko'rinishida yirik (uzoqdan o'qilsin), blok tanlanganda kichik
const LABEL_FAR = 3, LABEL_NEAR = 1.5;

type Slab = Mesh<BoxGeometry, MeshLambertMaterial>;
interface BlockNode {
  data: EngineBlock;
  group: Group;
  slabs: Map<number, Slab>;
  label: Sprite;
  edges: LineSegments;
  x: number; z: number; h: number;
}

// Matnli yorliq (sprite) — blok nomi va xonadon raqami uchun
function makeLabel(text: string, scale: number, dark = true): Sprite {
  const c = document.createElement('canvas');
  // 2x aniqlik — yorliq kattalashganda ham matn tiniq
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = dark ? 'rgba(1,66,66,0.94)' : 'rgba(255,255,255,0.94)';
    // roundRect eski brauzerlarda yo'q — oddiy to'rtburchak
    if (typeof g.roundRect === 'function') { g.beginPath(); g.roundRect(8, 8, 496, 112, 28); g.fill(); }
    else g.fillRect(8, 8, 496, 112);
    g.fillStyle = dark ? '#FFFFFF' : '#1C1B17';
    g.font = '600 60px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text.length > 14 ? text.slice(0, 13) + '…' : text, 256, 68);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const s = new Sprite(new SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(4 * scale, scale, 1);
  s.renderOrder = 10;
  return s;
}

function setOpacity(m: MeshLambertMaterial | SpriteMaterial | LineBasicMaterial, o: number) {
  m.opacity = o;
  m.transparent = o < 1 || m instanceof SpriteMaterial;
  m.depthWrite = o >= 1;
  m.needsUpdate = true;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createEngine(canvas: HTMLCanvasElement, opts: EngineOpts): Engine {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(C_BG);

  const scene = new Scene();
  scene.add(new HemisphereLight('#ffffff', '#cbbfa8', 1.6));
  const sun = new DirectionalLight('#ffffff', 1.4);
  sun.position.set(20, 40, 25);
  scene.add(sun);

  const camera = new PerspectiveCamera(40, 1, 0.5, 2000);
  const slabGeo = new BoxGeometry(W, H * SLAB, D);
  const blocks = new Map<number, BlockNode>();
  const pickables: Object3D[] = [];

  // Bloklar maydonchada qatorma-qator joylashadi
  const n = opts.blocks.length;
  const cols = Math.min(PER_ROW, Math.max(1, n));
  opts.blocks.forEach((b, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * GAP;
    const z = -row * GAP;
    const floorsN = Math.min(MAX_FLOORS, Math.max(1, b.maxFloor));
    const byFloor = new Map(b.floors.map((f) => [f.floor, f]));
    const group = new Group();
    group.position.set(x, 0, z);
    const slabs = new Map<number, Slab>();
    for (let f = 1; f <= floorsN; f++) {
      const info = byFloor.get(f);
      const color = new Color(C_EMPTY);
      // Qavat rangi = bo'sh xonadonlar ulushi (kulrang → yashil)
      if (info && info.total > 0) color.set(C_SOLD).lerp(new Color(C_FREE), info.available / info.total);
      const m = new Mesh(slabGeo, new MeshLambertMaterial({ color }));
      m.position.y = (f - 1) * H + (H * SLAB) / 2;
      m.userData = { pid: b.id, floor: f };
      group.add(m);
      slabs.set(f, m);
      pickables.push(m);
    }
    const h = floorsN * H;
    const edges = new LineSegments(
      new EdgesGeometry(new BoxGeometry(W + 0.4, h + 0.2, D + 0.4)),
      new LineBasicMaterial({ color: C_SEL }),
    );
    edges.position.y = h / 2;
    edges.visible = false;
    group.add(edges);
    const label = makeLabel(b.label, LABEL_FAR);
    label.position.set(0, h + 2.4, 0);
    group.add(label);
    scene.add(group);
    blocks.set(b.id, { data: b, group, slabs, label, edges, x, z, h });
  });

  // Maydoncha (yer)
  const rows = Math.max(1, Math.ceil(n / cols));
  const ground = new Mesh(
    new PlaneGeometry(cols * GAP + 30, rows * GAP + 30),
    new MeshLambertMaterial({ color: C_GROUND }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.01, -((rows - 1) * GAP) / 2);
  scene.add(ground);

  // Kesim (cutaway): tanlangan qavat plitasi va xonadon kataklari
  let plate: Group | null = null;
  let plateKey = '';
  const cellMeshes = new Map<number, Mesh<BoxGeometry, MeshLambertMaterial>>();

  function disposeObj(o: Object3D) {
    o.traverse((c) => {
      const any = c as Mesh;
      if (any.geometry && any.geometry !== slabGeo) any.geometry.dispose();
      const mat = (any as { material?: unknown }).material;
      const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
      for (const m of mats as (MeshLambertMaterial | SpriteMaterial)[]) {
        if ('map' in m && m.map) m.map.dispose();
        m.dispose();
      }
    });
  }

  function clearPlate() {
    if (!plate) return;
    for (const c of cellMeshes.values()) {
      const i = pickables.indexOf(c);
      if (i >= 0) pickables.splice(i, 1);
    }
    cellMeshes.clear();
    plate.parent?.remove(plate);
    disposeObj(plate);
    plate = null;
    plateKey = '';
  }

  function buildPlate(node: BlockNode, floor: number) {
    const key = `${node.data.id}:${floor}`;
    if (plateKey === key) return;
    clearPlate();
    const info = node.data.floors.find((f) => f.floor === floor);
    const g = new Group();
    g.position.y = (floor - 1) * H;
    const base = new Mesh(new BoxGeometry(W, 0.12, D), new MeshLambertMaterial({ color: '#EFE9DD' }));
    base.position.y = 0.06;
    g.add(base);
    const apts = info?.apts || [];
    const cnt = apts.length;
    if (cnt) {
      const rowsN = cnt <= 3 ? 1 : 2;
      const colsN = Math.ceil(cnt / rowsN);
      const gap = 0.25, corridor = rowsN === 2 ? 1.2 : 0;
      const cw = (W - gap * (colsN + 1)) / colsN;
      const cd = rowsN === 1 ? D * 0.8 : (D - corridor - gap * 2) / 2;
      apts.forEach((a, i) => {
        // Old qator chapdan o'ngga, orqa qator o'ngdan chapga (yo'lak atrofida)
        const front = rowsN === 1 || i < colsN;
        const ci = front ? i : colsN - 1 - (i - colsN);
        const x = -W / 2 + gap + cw / 2 + ci * (cw + gap);
        const z = rowsN === 1 ? 0 : front ? D / 2 - gap - cd / 2 : -D / 2 + gap + cd / 2;
        const cell = new Mesh(new BoxGeometry(cw, 0.6, cd), new MeshLambertMaterial({ color: C_CELL[a.status] }));
        cell.position.set(x, 0.42, z);
        cell.userData = { pid: node.data.id, floor, aid: a.id, base: C_CELL[a.status] };
        g.add(cell);
        cellMeshes.set(a.id, cell);
        pickables.push(cell);
        const lbl = makeLabel(a.number, 0.55, false);
        lbl.position.set(x, 1.2, z);
        g.add(lbl);
      });
    }
    node.group.add(g);
    plate = g;
    plateKey = key;
  }

  // Kamera holati: nishon + yo'nalish + masofa (+ foydalanuvchi burishi)
  const cur = { target: new Vector3(), dir: new Vector3(0.6, 0.75, 1).normalize(), dist: 60 };
  const from = { target: new Vector3(), dir: new Vector3(), dist: 0 };
  const to = { target: new Vector3(), dir: new Vector3(), dist: 0 };
  let tweenStart = 0;
  let tweening = false;
  let yaw = 0;
  // "Boshidan" bosilganda foydalanuvchi burgan burchak ham silliq qaytadi
  let yawFrom = 0, yawTo: number | null = null;
  let aspect = 1;
  const tmp = new Vector3();

  function applyCamera() {
    tmp.copy(cur.dir).applyAxisAngle(new Vector3(0, 1, 0), yaw).multiplyScalar(cur.dist);
    camera.position.copy(cur.target).add(tmp);
    camera.lookAt(cur.target);
  }

  function viewFor(s: EngineSel) {
    const node = s.pid !== null ? blocks.get(s.pid) : undefined;
    const fit = aspect < 1 ? 1.15 / aspect : 1;
    if (!node) {
      const span = Math.max(cols * GAP, rows * GAP);
      const tallest = Math.max(1, ...Array.from(blocks.values()).map((b) => b.h));
      return { target: new Vector3(0, tallest / 2, -((rows - 1) * GAP) / 2), dir: new Vector3(0.55, 0.6, 1).normalize(), dist: (span * 0.85 + tallest + 14) * fit };
    }
    if (s.floor === null) {
      return { target: new Vector3(node.x, node.h / 2, node.z), dir: new Vector3(0.5, 0.42, 1).normalize(), dist: (Math.max(node.h, W) * 1.7 + 10) * fit };
    }
    const y = (s.floor - 1) * H;
    const t = new Vector3(node.x, y, node.z);
    const cell = s.aid !== null ? cellMeshes.get(s.aid) : undefined;
    if (cell) t.lerp(new Vector3(node.x + cell.position.x, y, node.z + cell.position.z), 0.35);
    return { target: t, dir: new Vector3(0.3, 1.15, 1).normalize(), dist: (s.aid !== null ? 15 : 18) * fit };
  }

  // Faqat kerak bo'lganda kadr chizish
  let raf = 0;
  function frame(now: number) {
    raf = 0;
    if (tweening) {
      const k = Math.min(1, (now - tweenStart) / DUR);
      const e = ease(k);
      cur.target.lerpVectors(from.target, to.target, e);
      cur.dir.lerpVectors(from.dir, to.dir, e).normalize();
      cur.dist = from.dist + (to.dist - from.dist) * e;
      if (yawTo !== null) yaw = yawFrom + (yawTo - yawFrom) * e;
      if (k >= 1) { tweening = false; yawTo = null; }
    }
    applyCamera();
    renderer.render(scene, camera);
    if (tweening) requestRender();
  }
  function requestRender() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function snap() {
    if (!tweening) return;
    cur.target.copy(to.target); cur.dir.copy(to.dir); cur.dist = to.dist;
    if (yawTo !== null) { yaw = yawTo; yawTo = null; }
    tweening = false;
  }

  let lastSel: EngineSel = { pid: null, floor: null, aid: null };
  let first = true;

  function update(s: EngineSel) {
    lastSel = s;
    for (const node of blocks.values()) {
      const active = s.pid === null || s.pid === node.data.id;
      const cut = s.pid === node.data.id && s.floor !== null ? s.floor : null;
      // Tanlanmagan bloklar xira — kamerani to'smaydi
      const base = active ? 1 : 0.14;
      for (const [f, m] of node.slabs) {
        if (cut !== null && f === cut) { m.visible = false; continue; }
        m.visible = true;
        const ghost = cut !== null && f > cut;
        m.userData.ghost = ghost;
        setOpacity(m.material, ghost ? 0.06 : base);
      }
      node.edges.visible = s.pid === node.data.id && cut === null;
      setOpacity(node.label.material, active ? 1 : 0.35);
      const ls = s.pid === null ? LABEL_FAR : LABEL_NEAR;
      node.label.scale.set(4 * ls, ls, 1);
      node.label.position.y = cut !== null ? cut * H + 2.2 : node.h + (s.pid === null ? 2.4 : 1.5);
    }
    const node = s.pid !== null ? blocks.get(s.pid) : undefined;
    if (node && s.floor !== null && node.slabs.has(s.floor)) buildPlate(node, s.floor);
    else clearPlate();
    for (const [id, c] of cellMeshes) {
      const sel = id === s.aid;
      c.material.color.set(sel ? C_SEL : (c.userData.base as string));
      c.position.y = sel ? 0.62 : 0.42;
    }
    const v = viewFor(s);
    setHover(null);
    if (first || opts.reducedMotion || document.hidden) {
      cur.target.copy(v.target); cur.dir.copy(v.dir); cur.dist = v.dist;
      if (s.pid === null) yaw = 0;
      yawTo = null;
      tweening = false;
      first = false;
    } else {
      yawFrom = yaw;
      yawTo = s.pid === null ? 0 : null;
      from.target.copy(cur.target); from.dir.copy(cur.dir); from.dist = cur.dist;
      to.target.copy(v.target); to.dir.copy(v.dir); to.dist = v.dist;
      tweenStart = performance.now();
      tweening = true;
    }
    requestRender();
  }

  // O'lcham o'zgarishi
  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const v = viewFor(lastSel);
    cur.dist = v.dist;
    if (tweening) to.dist = v.dist;
    requestRender();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Bosish (tanlash) va gorizontal sudrash (burish)
  const ray = new Raycaster();
  const ndc = new Vector2();
  let down: { x: number; y: number; yaw: number; id: number } | null = null;
  let dragged = false;

  // Ustiga kelganda: bosiladigan qavat/katak yengil yorishadi, kursor qo'l shaklida
  type Lit = Mesh<BoxGeometry, MeshLambertMaterial>;
  let hovered: Lit | null = null;
  function setHover(m: Lit | null) {
    if (hovered === m) return;
    hovered?.material.emissive.set('#000000');
    hovered = m;
    m?.material.emissive.set(C_HOVER);
    canvas.style.cursor = m ? 'pointer' : 'grab';
    requestRender();
  }
  function pickAt(e: PointerEvent): Lit | null {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false).find((h) => h.object.visible && !h.object.userData.ghost);
    return (hit?.object as Lit) ?? null;
  }

  function onDown(e: PointerEvent) {
    down = { x: e.clientX, y: e.clientY, yaw, id: e.pointerId };
    dragged = false;
  }
  function onMove(e: PointerEvent) {
    if (!down) { if (e.pointerType === 'mouse' && !tweening) setHover(pickAt(e)); return; }
    if (e.pointerId !== down.id) return;
    const dx = e.clientX - down.x;
    if (!dragged && Math.abs(dx) > 6) { dragged = true; canvas.setPointerCapture?.(e.pointerId); }
    if (dragged) {
      snap();
      yaw = Math.max(-1.2, Math.min(1.2, down.yaw - dx * 0.006));
      requestRender();
    }
  }
  function onUp(e: PointerEvent) {
    if (!down || e.pointerId !== down.id) return;
    const wasDrag = dragged;
    down = null;
    dragged = false;
    if (wasDrag) return;
    const hit = pickAt(e);
    if (!hit) return;
    const u = hit.userData as { pid: number; floor: number; aid?: number };
    opts.onPick({ pid: u.pid, floor: u.floor ?? null, aid: u.aid ?? null });
  }
  function onCancel() { down = null; dragged = false; }
  const onLeave = () => setHover(null);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);

  // Yashirin tabda chizmaymiz
  function onVis() {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      snap();
    } else requestRender();
  }
  document.addEventListener('visibilitychange', onVis);

  function onLost(e: Event) { e.preventDefault(); opts.onLost(); }
  canvas.addEventListener('webglcontextlost', onLost);

  return {
    update,
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('webglcontextlost', onLost);
      clearPlate();
      disposeObj(scene);
      slabGeo.dispose();
      renderer.dispose();
    },
  };
}
