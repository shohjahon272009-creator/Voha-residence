import db from './db';
import { fetchSaleHouseInventory, salehouseFixture, type ShApartment, type ShBlock, type ShStatus } from './salehouse';

/*
  Sale House -> sayt: TO'LIQ yuklash (Sale House — haqiqat manbai). Sale House'ga hech narsa
  yozilmaydi (lib/salehouse.ts faqat GET). NARX olinmaydi va saytdagi narxga tegilmaydi.

  Loyiha (blok) moslash:
   1) Admin/oldingi import saqlagan moslik (settings `_salehouse_map`: {"<SH blok id>": <sayt loyiha id>})
   2) Blok raqami: "1-Blok" -> 1 = sayt loyihasining block_no (raqam Sale House'da yagona bo'lsa)
   3) Nomi bir xil ("blok" so'zi, bo'sh joy, katta-kichik harf hisobga olinmaydi)
   Mos topilmagan Sale House bloki (masalan "A blok") — saytda yangi loyiha sifatida yaratiladi.

  Xonadonlar (moslangan loyiha ichida, raqami bo'yicha "012" = "12"):
   - Sale House'da bor, saytda yo'q  -> qo'shiladi (raqam, qavat, xona, m², holat; rasmsiz, narxsiz)
   - ikkalasida bor                  -> qavat/xona/m² va holat Sale House'dagidek
   - saytda bor, Sale House'da yo'q  -> "Band" (sotuvdan chiqadi; o'chirilmaydi — bron/sotuvlar bog'langan)
   - Sale House'da "inactive"        -> saytda "Band"
   Do'kon (M…), parkovka (P…), xonasi 0 yoki qavati < 1 bo'lgan joylar xonadon sifatida olinmaydi.

  Sale House'da yo'q sayt loyihalari (eski bloklar) -> "Topshirilgan", bo'sh xonadonlari "Band".
*/

const TO_SITE: Record<ShStatus, string> = { free: "Bo'sh", hold: 'Bronlangan', sold: 'Band', inactive: 'Band' };

const norm = (s: string) => s.toLowerCase().replace(/['‘’`ʻ]/g, '').replace(/[\s_-]+/g, ' ').replace(/\bblok\b|\bblock\b/g, '').trim();
const blockNum = (s: string) => { const m = s.match(/\d+/); return m ? Number(m[0]) : null; };
const aptKey = (n: string) => n.trim().replace(/^0+(?=\d)/, '').toLowerCase();
const residential = (a: ShApartment) =>
  Boolean(a.number) && /\d/.test(a.number) && !/^[mp]/i.test(a.number) && (a.rooms ?? 0) >= 1 && (a.floor ?? 0) >= 1;

type SiteProject = { id: number; name_uz: string; block_no: number | null; status: string | null };
type SiteApt = { id: number; project_id: number; number: string; status: string; floor: number | null; rooms: number | null; area: number | null };

export type SyncReport = {
  at: string;
  blocks: { sh: ShBlock; siteProject: SiteProject | null; how: string; shCount: number; matched: number }[];
  // Holat o'zgarishlari (mavjud xonadonlar)
  changes: { aptId: number; project: string; number: string; from: string; to: string }[];
  // Qavat / xona / maydon farqlari
  updates: { aptId: number; project: string; number: string; floor: number | null; rooms: number | null; area: number | null }[];
  // Yangi xonadonlar (blockId bo'yicha loyihaga yoziladi)
  creates: { blockId: string; project: string; number: string; floor: number | null; rooms: number | null; area: number | null; status: string }[];
  // Sale House'da yo'q — sotuvdan chiqadi
  hides: { aptId: number; project: string; number: string; from: string }[];
  newProjects: { blockId: string; name: string }[];
  retire: { projectId: number; name: string; from: string; freeApts: number }[];
  skipped: number;          // do'kon / parkovka / raqamsiz
  notOnSite: number;        // eski hisobot bilan moslik uchun (= creates.length)
  notInSaleHouse: number;   // = hides.length
  unmatchedSiteProjects: string[];
};

async function loadMap(): Promise<Record<string, number>> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').get('_salehouse_map') as { value: string } | undefined;
  try { return row?.value ? JSON.parse(row.value) : {}; } catch { return {}; }
}

const save = (key: string, value: string) =>
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);

export async function buildReport(): Promise<SyncReport> {
  const [{ blocks, apartments }, manual] = await Promise.all([salehouseFixture() ?? fetchSaleHouseInventory(), loadMap()]);
  // Xavfsizlik: bo'sh/yarim javob bilan butun saytni "topshirilgan" qilib yubormaslik uchun
  if (blocks.length === 0 || apartments.length === 0) throw new Error("Sale House bo'sh javob qaytardi — hech narsa o'zgartirilmadi");

  const projects = await db.prepare('SELECT id, name_uz, block_no, status FROM projects').all() as SiteProject[];
  const siteApts = await db.prepare('SELECT id, project_id, number, status, floor, rooms, area FROM apartments').all() as SiteApt[];

  const byShNum = new Map<number, number>();
  for (const b of blocks) { const n = blockNum(b.name); if (n != null) byShNum.set(n, (byShNum.get(n) || 0) + 1); }

  const match = (b: ShBlock): { p: SiteProject | null; how: string } => {
    if (manual[b.id] != null) {
      const p = projects.find((x) => x.id === Number(manual[b.id]));
      if (p) return { p, how: 'saqlangan moslik' };
    }
    const n = blockNum(b.name);
    if (n != null && byShNum.get(n) === 1) {
      const hits = projects.filter((p) => Number(p.block_no) === n);
      if (hits.length === 1) return { p: hits[0], how: 'blok raqami' };
    }
    const names = [norm(b.name), norm(`${b.projectName} ${b.name}`)];
    const byName = projects.filter((p) => names.includes(norm(p.name_uz)));
    if (byName.length === 1) return { p: byName[0], how: 'nomi' };
    return { p: null, how: 'yangi loyiha' };
  };

  const report: SyncReport = {
    at: new Date().toISOString(), blocks: [], changes: [], updates: [], creates: [], hides: [],
    newProjects: [], retire: [], skipped: 0, notOnSite: 0, notInSaleHouse: 0, unmatchedSiteProjects: [],
  };
  const usedProjects = new Set<number>();

  for (const b of blocks) {
    const { p, how } = match(b);
    const all = apartments.filter((a) => a.blockId === b.id);
    const list: ShApartment[] = [];
    const keys = new Set<string>();
    for (const a of all) {
      const k = aptKey(a.number);
      if (!residential(a) || keys.has(k)) { report.skipped++; continue; }
      keys.add(k);
      list.push(a);
    }
    const projectName = p?.name_uz ?? b.name;
    if (!p) report.newProjects.push({ blockId: b.id, name: b.name });
    else usedProjects.add(p.id);

    const site = new Map(siteApts.filter((a) => p && a.project_id === p.id).map((a) => [aptKey(String(a.number)), a]));
    let matched = 0;
    for (const a of list) {
      const to = TO_SITE[a.status];
      const s = site.get(aptKey(a.number));
      if (!s) {
        // Sotuvdan olinganlar saytga yangi qo'shilmaydi
        if (a.status !== 'inactive') report.creates.push({ blockId: b.id, project: projectName, number: a.number, floor: a.floor, rooms: a.rooms, area: a.area, status: to });
        continue;
      }
      matched++;
      if (s.status !== to) report.changes.push({ aptId: s.id, project: projectName, number: String(s.number), from: s.status, to });
      const areaDiff = a.area != null && Math.abs(Number(s.area ?? 0) - a.area) > 0.01;
      if ((a.floor != null && s.floor !== a.floor) || (a.rooms != null && s.rooms !== a.rooms) || areaDiff) {
        report.updates.push({ aptId: s.id, project: projectName, number: String(s.number), floor: a.floor, rooms: a.rooms, area: a.area });
      }
    }
    for (const [k, s] of site) {
      if (!keys.has(k) && s.status !== 'Band') report.hides.push({ aptId: s.id, project: projectName, number: String(s.number), from: s.status });
    }
    report.blocks.push({ sh: b, siteProject: p, how, shCount: list.length, matched });
  }

  // Sale House'da yo'q loyihalar — topshirilgan (faqat hali "topshirilgan" bo'lmaganlari)
  for (const p of projects) {
    if (usedProjects.has(p.id)) continue;
    report.unmatchedSiteProjects.push(p.name_uz);
    if (p.status !== 'Topshirilgan') {
      const freeApts = siteApts.filter((a) => a.project_id === p.id && a.status !== 'Band').length;
      report.retire.push({ projectId: p.id, name: p.name_uz, from: p.status || '—', freeApts });
    }
  }
  report.notOnSite = report.creates.length;
  report.notInSaleHouse = report.hides.length;
  return report;
}

/** Jami o'zgarishlar soni (admin tugmasi va bo'sh hisobotni aniqlash uchun). */
export const reportSize = (r: SyncReport) =>
  r.changes.length + (r.updates?.length || 0) + (r.creates?.length || 0) + (r.hides?.length || 0) + (r.newProjects?.length || 0) + (r.retire?.length || 0);

/** Hisobotni saytga yozadi (faqat sayt bazasi; narx ustunlariga tegilmaydi). Qaytaradi: o'zgargan yozuvlar soni. */
export async function applyReport(report: SyncReport): Promise<number> {
  let n = 0;
  const map = await loadMap();
  const projectOf = new Map<string, number>();
  for (const b of report.blocks) if (b.siteProject) projectOf.set(b.sh.id, b.siteProject.id);

  // 1) Yangi loyihalar (masalan "A blok") — rasmlarini admin keyin qo'shadi
  for (const np of report.newProjects || []) {
    if (map[np.blockId] != null) { projectOf.set(np.blockId, Number(map[np.blockId])); continue; }
    const r = await db.prepare(
      "INSERT INTO projects (name_uz, name_ru, name_en, status, city) VALUES (?, ?, ?, 'Jarayonda', 'Xorazm')",
    ).run(np.name, np.name, np.name);
    const id = Number(r.lastInsertRowid);
    if (id) { projectOf.set(np.blockId, id); map[np.blockId] = id; n++; }
  }
  await save('_salehouse_map', JSON.stringify(map));

  // 2) Yangi xonadonlar
  for (const c of report.creates || []) {
    const pid = projectOf.get(c.blockId);
    if (!pid) continue;
    // Oradagi ikkinchi import bilan takrorlanmasin
    const exists = await db.prepare('SELECT id FROM apartments WHERE project_id = ? AND LOWER(TRIM(number)) = LOWER(TRIM(?))').get(pid, c.number);
    if (exists) continue;
    await db.prepare('INSERT INTO apartments (project_id, floor, number, rooms, area, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(pid, c.floor, c.number, c.rooms, c.area, c.status);
    n++;
  }

  // 3) Qavat / xona / maydon
  for (const u of report.updates || []) {
    const r = await db.prepare('UPDATE apartments SET floor = COALESCE(?, floor), rooms = COALESCE(?, rooms), area = COALESCE(?, area) WHERE id = ?')
      .run(u.floor, u.rooms, u.area, u.aptId);
    n += Number(r.changes) || 0;
  }

  // 4) Holatlar ("WHERE status = eski" — oradagi qo'lda o'zgarishni bosib ketmaydi)
  for (const c of report.changes) {
    const r = await db.prepare('UPDATE apartments SET status = ? WHERE id = ? AND status = ?').run(c.to, c.aptId, c.from);
    n += Number(r.changes) || 0;
  }
  for (const h of report.hides || []) {
    const r = await db.prepare("UPDATE apartments SET status = 'Band' WHERE id = ? AND status = ?").run(h.aptId, h.from);
    n += Number(r.changes) || 0;
  }

  // 5) Sale House'da yo'q loyihalar — topshirilgan
  for (const p of report.retire || []) {
    const r = await db.prepare("UPDATE projects SET status = 'Topshirilgan' WHERE id = ? AND COALESCE(status, '') <> 'Topshirilgan'").run(p.projectId);
    n += Number(r.changes) || 0;
    const a = await db.prepare("UPDATE apartments SET status = 'Band' WHERE project_id = ? AND status <> 'Band'").run(p.projectId);
    n += Number(a.changes) || 0;
  }

  const summary = JSON.stringify({ at: report.at, applied: n, changes: reportSize(report), notOnSite: report.creates?.length || 0 });
  await save('_salehouse_last_sync', summary);
  return n;
}
