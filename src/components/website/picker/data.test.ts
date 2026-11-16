// Ma'lumotni shakllantirish testi: `npx tsx src/components/website/picker/data.test.ts`
import assert from 'node:assert/strict';
import type { Apartment, Project } from '@/lib/types';
import {
  buildModel, countAvailableMatching, dedupeApartments, formatHash, parseHash, resolveSel, similarApartments, statusKind,
} from './data';

const proj = (id: number, extra: Partial<Project> = {}): Project => ({
  id, name_uz: `P${id}`, name_ru: '', name_en: '', description_uz: '', description_ru: '', description_en: '',
  address: '', city: '', district: '', status: 'Jarayonda', min_price: 0, total_floors: 0, main_image: '', gallery: [],
  lat: 0, lng: 0, amenities: [], apts_per_floor: 0, days_left: 0, categories: [], ...extra,
});
let seq = 1;
const apt = (pid: number, floor: number | null, number: string, status: string, rooms = 2, area = 60): Apartment => ({
  id: seq++, project_id: pid, floor: floor as number, number, rooms, area, price_cash: 0, price_installment: 0,
  status: status as Apartment['status'], plan_image: '', image: '', orientation: '', note: '',
});

const projects = [proj(1, { block_no: 1 }), proj(2, { status: 'Topshirilgan' }), proj(3, { is_sold_out: true }), proj(4, { total_floors: 9 })];
const apts = [
  apt(1, 5, '21', "Bo'sh"), apt(1, 5, '21', 'Band'), /* takror */ apt(1, 5, '22', 'Bronlangan'), apt(1, 5, '10', 'Band'),
  apt(1, 3, '5', "Bo‘sh", 2, 55), apt(1, null, '99', "Bo'sh", 3, 90),
  apt(2, 1, '1', "Bo'sh"), apt(3, 1, '1', "Bo'sh"), apt(4, 2, '7', "Bo'sh", 2, 70),
];

// Holat
assert.equal(statusKind("Bo'sh"), 'available');
assert.equal(statusKind('Bo‘sh'), 'available');
assert.equal(statusKind('Bronlangan'), 'reserved');
assert.equal(statusKind('Band'), 'sold');

// Takrorlar
assert.equal(dedupeApartments(apts).removed, 1);

const m = buildModel(projects, apts);
assert.deepEqual(m.blocks.map((b) => b.id), [1, 4], 'topshirilgan va sotib tugagan loyihalar chiqmaydi');
assert.equal(m.removedDuplicates, 1);
const b1 = m.byId.get(1)!;
assert.deepEqual(b1.floors.map((g) => g.key), ['3', '5', 'na'], "qavatlar o'sish tartibida, noma'lum oxirida");
assert.equal(b1.maxFloor, 5, "total_floors yo'q — xonadonlardan olinadi");
assert.equal(m.byId.get(4)!.maxFloor, 9);
const f5 = b1.floors[1];
assert.deepEqual(f5.apts.map((a) => a.number), ['10', '21', '22'], 'raqam tabiiy tartibda');
assert.equal(f5.apts.find((a) => a.number === '21')!.status, 'Band', "nusxalar farq qilsa band holat ustun (sotilgan xonadon bo'sh ko'rinmasin)");
assert.deepEqual(f5.counts, { total: 3, available: 0, reserved: 1, sold: 2 });
assert.deepEqual(b1.counts, { total: 5, available: 2, reserved: 1, sold: 2 });

// Bir xil holatdagi nusxalardan planirovkasi bori qoladi
const withPlan = { ...apt(1, 7, '70', "Bo'sh"), plan_image: '/p.png' };
assert.equal(dedupeApartments([apt(1, 7, '70', "Bo'sh"), withPlan]).list[0].plan_image, '/p.png');

// Bloklar tartibi: raqam bo'yicha, raqamsizlari nom bo'yicha (kiritilgan tartibdan qat'i nazar)
const order = buildModel(
  [proj(9, { name_uz: 'A blok' }), proj(8, { name_uz: '11-Blok' }), proj(7, { name_uz: '10-Blok' }), proj(6, { name_uz: '1-blok', block_no: 1 })],
  [],
).blocks.map((b) => b.project.name_uz);
assert.deepEqual(order, ['1-blok', '10-Blok', '11-Blok', 'A blok']);

// Filtr
assert.equal(countAvailableMatching(b1.floors.flatMap((g) => g.apts), { rooms: [3], areaMin: null, areaMax: null }), 1);
assert.equal(countAvailableMatching(b1.floors.flatMap((g) => g.apts), { rooms: [4], areaMin: null, areaMax: null }), 0);
assert.equal(countAvailableMatching(b1.floors.flatMap((g) => g.apts), { rooms: [], areaMin: 50, areaMax: 80 }), 1);

// O'xshash: sotilgan 10-xonadon (2 xona, 5-qavat) → avval shu blokdagi yaqin qavat
const sold = f5.apts.find((a) => a.number === '10')!;
const sim = similarApartments(m, sold);
assert.deepEqual(sim.map((r) => r.apt.number), ['5', '7']);

// Hash
const target = f5.apts[1];
const h = formatHash({ pid: 1, fk: '5', aid: target.id });
assert.equal(h, `#xonadon=1-5-${target.id}`);
assert.deepEqual(parseHash(h), { pid: 1, fk: '5', aid: target.id });
assert.deepEqual(parseHash('#xonadon=1-na'), { pid: 1, fk: 'na', aid: null });
assert.deepEqual(parseHash('#xonadon=1--2-3'), { pid: 1, fk: '-2', aid: 3 });
assert.equal(parseHash('#calculator'), null);
assert.equal(resolveSel(m, { pid: 1, fk: '5', aid: target.id }).apt?.id, target.id);
assert.equal(resolveSel(m, { pid: 77, fk: '5', aid: 99999 }).block, null, 'eskirgan havola xatosiz');
assert.equal(resolveSel(m, { pid: 2, fk: null, aid: null }).block, null, 'faol emas loyiha');

console.log('picker data: all tests passed');
