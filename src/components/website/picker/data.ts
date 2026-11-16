// Xonadon tanlash: ma'lumotni guruhlash, takrorlarni olib tashlash, holat hisoblari.
// Faqat sof funksiyalar — React yo'q, shuning uchun tsx bilan alohida test qilinadi.
import type { Apartment, Project } from '@/lib/types';

export type StatusKind = 'available' | 'reserved' | 'sold';

export interface Counts { total: number; available: number; reserved: number; sold: number }

export interface FloorGroup {
  key: string;            // "5" yoki "na" (qavat noma'lum)
  floor: number | null;
  apts: Apartment[];      // raqam bo'yicha tartiblangan
  counts: Counts;
}

export interface BlockModel {
  id: number;
  project: Project;
  floors: FloorGroup[];   // o'sish tartibida, noma'lum qavat oxirida
  counts: Counts;
  maxFloor: number;       // total_floors yoki xonadonlardagi eng baland qavat
}

export interface AptRef { apt: Apartment; block: BlockModel; floor: FloorGroup }

export interface PickerModel {
  blocks: BlockModel[];
  byId: Map<number, BlockModel>;
  aptById: Map<number, AptRef>;
  removedDuplicates: number;
}

export interface Filters { rooms: number[]; areaMin: number | null; areaMax: number | null }
export const EMPTY_FILTERS: Filters = { rooms: [], areaMin: null, areaMax: null };

export const UNKNOWN_FLOOR = 'na';

// Holat matnini turga aylantiramiz (to'g'ri va "jingalak" apostrof ikkalasi ham)
export function statusKind(s: string | null | undefined): StatusKind {
  const v = (s || '').replace(/[‘’ʻ`]/g, "'").trim();
  if (v === "Bo'sh") return 'available';
  if (v === 'Bronlangan') return 'reserved';
  return 'sold';
}

export function emptyCounts(): Counts { return { total: 0, available: 0, reserved: 0, sold: 0 }; }

export function countStatuses(apts: Apartment[]): Counts {
  const c = emptyCounts();
  for (const a of apts) { c.total++; c[statusKind(a.status)]++; }
  return c;
}

// Bo'sh xonadonlar ulushi (0..1); xonadon bo'lmasa 0
export function availableShare(c: Counts): number { return c.total ? c.available / c.total : 0; }

// Qavat: null/NaN — noma'lum
export function floorOf(a: Apartment): number | null {
  const f = (a as { floor: unknown }).floor;
  if (f === null || f === undefined || f === '') return null;
  const n = Number(f);
  return Number.isFinite(n) ? n : null;
}

export function floorKey(f: number | null): string { return f === null ? UNKNOWN_FLOOR : String(f); }

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
export function byNumber(a: Apartment, b: Apartment): number {
  return collator.compare(String(a.number ?? ''), String(b.number ?? '')) || a.id - b.id;
}

// Bitta loyihada bir xil (qavat, raqam) takrorlanadi (bazadagi xato) — bittasini qoldiramiz.
// Nusxalar farq qilsa ehtiyotkor tanlov: band holat ustun (sotilgan xonadon "bo'sh" ko'rinmasin),
// keyin planirovkasi bor nusxa.
const TAKEN: Record<StatusKind, number> = { sold: 2, reserved: 1, available: 0 };
export function dedupeApartments(apts: Apartment[]): { list: Apartment[]; removed: number } {
  const best = new Map<string, Apartment>();
  for (const a of apts) {
    const k = `${a.project_id}|${floorKey(floorOf(a))}|${String(a.number ?? '').trim().toLowerCase()}`;
    const cur = best.get(k);
    if (!cur) { best.set(k, a); continue; }
    const d = TAKEN[statusKind(a.status)] - TAKEN[statusKind(cur.status)];
    if (d > 0 || (d === 0 && !cur.plan_image && a.plan_image)) best.set(k, a);
  }
  const list = Array.from(best.values());
  return { list, removed: apts.length - list.length };
}

export function isActiveProject(p: Project): boolean { return p.status !== 'Topshirilgan' && !p.is_sold_out; }

// Bloklar tartibi: blok raqami bo'yicha, raqamsizlari nom bo'yicha ("1-blok", "10-blok", "A blok")
function byBlock(a: Project, b: Project): number {
  const x = Number(a.block_no) || 0, y = Number(b.block_no) || 0;
  if (x && y && x !== y) return x - y;
  return collator.compare(a.name_uz || '', b.name_uz || '') || a.id - b.id;
}

export function buildModel(projects: Project[], apartments: Apartment[]): PickerModel {
  const active = projects.filter(isActiveProject).sort(byBlock);
  const ids = new Set(active.map((p) => p.id));
  const { list, removed } = dedupeApartments(apartments.filter((a) => ids.has(a.project_id)));

  const perProject = new Map<number, Apartment[]>();
  for (const a of list) {
    const arr = perProject.get(a.project_id);
    if (arr) arr.push(a); else perProject.set(a.project_id, [a]);
  }

  const blocks: BlockModel[] = [];
  const byId = new Map<number, BlockModel>();
  const aptById = new Map<number, AptRef>();

  for (const p of active) {
    const apts = perProject.get(p.id) || [];
    const groups = new Map<string, FloorGroup>();
    for (const a of apts) {
      const f = floorOf(a);
      const k = floorKey(f);
      let g = groups.get(k);
      if (!g) { g = { key: k, floor: f, apts: [], counts: emptyCounts() }; groups.set(k, g); }
      g.apts.push(a);
    }
    const floors = Array.from(groups.values()).sort((x, y) => {
      if (x.floor === null) return 1;
      if (y.floor === null) return -1;
      return x.floor - y.floor;
    });
    for (const g of floors) { g.apts.sort(byNumber); g.counts = countStatuses(g.apts); }
    const known = floors.filter((g) => g.floor !== null).map((g) => g.floor as number);
    const maxFloor = Math.max(Number(p.total_floors) || 0, known.length ? Math.max(...known) : 0);
    const block: BlockModel = { id: p.id, project: p, floors, counts: countStatuses(apts), maxFloor };
    blocks.push(block);
    byId.set(p.id, block);
    for (const g of floors) for (const a of g.apts) aptById.set(a.id, { apt: a, block, floor: g });
  }

  return { blocks, byId, aptById, removedDuplicates: removed };
}

export function hasFilters(f: Filters): boolean { return f.rooms.length > 0 || f.areaMin !== null || f.areaMax !== null; }

// Xona filtri: 4 = "4 va undan ko'p"
export function matchesFilter(a: Apartment, f: Filters): boolean {
  if (f.rooms.length) {
    const r = Number(a.rooms) || 0;
    if (!f.rooms.some((x) => (x >= 4 ? r >= 4 : r === x))) return false;
  }
  const area = Number(a.area) || 0;
  if (f.areaMin !== null && area < f.areaMin) return false;
  if (f.areaMax !== null && area > f.areaMax) return false;
  return true;
}

export function countAvailableMatching(apts: Apartment[], f: Filters): number {
  let n = 0;
  for (const a of apts) if (statusKind(a.status) === 'available' && matchesFilter(a, f)) n++;
  return n;
}

export function blockApartments(b: BlockModel): Apartment[] { return b.floors.flatMap((g) => g.apts); }

// Maydon chegaralari (filtr inputlari uchun)
export function areaBounds(model: PickerModel): { min: number; max: number } {
  let min = Infinity, max = 0;
  for (const { apt } of model.aptById.values()) {
    const v = Number(apt.area) || 0;
    if (v <= 0) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min === Infinity ? { min: 0, max: 0 } : { min: Math.floor(min), max: Math.ceil(max) };
}

// O'xshash bo'sh xonadonlar: xona soni bir xil, avval shu blok va yaqin qavatlar
export function similarApartments(model: PickerModel, apt: Apartment, limit = 4): AptRef[] {
  const f0 = floorOf(apt);
  const out: { ref: AptRef; score: number }[] = [];
  for (const ref of model.aptById.values()) {
    const a = ref.apt;
    if (a.id === apt.id || statusKind(a.status) !== 'available') continue;
    if ((Number(a.rooms) || 0) !== (Number(apt.rooms) || 0)) continue;
    const f = floorOf(a);
    const floorDist = f0 === null || f === null ? 50 : Math.abs(f - f0);
    const score = (a.project_id === apt.project_id ? 0 : 1000) + floorDist;
    out.push({ ref, score });
  }
  out.sort((x, y) => x.score - y.score || byNumber(x.ref.apt, y.ref.apt));
  return out.slice(0, limit).map((x) => x.ref);
}

// Deep link: #xonadon=<projectId>-<floor|na>-<aptId>, qisman ham bo'lishi mumkin
export interface Sel { pid: number | null; fk: string | null; aid: number | null }
export const EMPTY_SEL: Sel = { pid: null, fk: null, aid: null };

export function formatHash(s: Sel): string {
  if (s.pid === null) return '';
  let v = `${s.pid}`;
  if (s.fk !== null) {
    v += `-${s.fk}`;
    if (s.aid !== null) v += `-${s.aid}`;
  }
  return `#xonadon=${v}`;
}

export function parseHash(hash: string): Sel | null {
  const m = /^#?xonadon=(\d+)(?:-(na|-?\d+)(?:-(\d+))?)?$/.exec(decodeURIComponent(hash || ''));
  if (!m) return null;
  return { pid: Number(m[1]), fk: m[2] ?? null, aid: m[3] ? Number(m[3]) : null };
}

// Tanlovni modelga solishtiramiz: eskirgan havola bo'lsa ham xato bermaydi
export function resolveSel(model: PickerModel, s: Sel): { block: BlockModel | null; floor: FloorGroup | null; apt: Apartment | null } {
  if (s.aid !== null) {
    const ref = model.aptById.get(s.aid);
    if (ref && (s.pid === null || ref.block.id === s.pid)) return { block: ref.block, floor: ref.floor, apt: ref.apt };
  }
  const block = s.pid !== null ? model.byId.get(s.pid) ?? null : null;
  const floor = block && s.fk !== null ? block.floors.find((g) => g.key === s.fk) ?? null : null;
  return { block, floor, apt: null };
}
