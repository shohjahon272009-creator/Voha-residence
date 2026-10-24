import db from './db';
import { fetchSaleHouseInventory, type ShApartment, type ShBlock, type ShStatus } from './salehouse';

/*
  Sale House -> sayt: xonadon HOLATINI sinxronlash (Sale House — haqiqat manbai).
  Sale House'ga hech narsa yozilmaydi (lib/salehouse.ts faqat GET).

  Moslash:
   1) Admin qo'lda belgilagan moslik (settings `_salehouse_map`: {"<SH blok id>": <sayt loyiha id>})
   2) Blok raqami: Sale House blok nomidagi raqam ("1-Blok" -> 1) = sayt loyihasining block_no,
      faqat shu raqam Sale House'da YAGONA bo'lsa (ikki majmuada "1-blok" bo'lsa — qo'lda moslash kerak)
   3) Nomi bir xil (katta-kichik harf, bo'sh joy, "blok" so'zi hisobga olinmaydi)
  Xonadon: shu loyiha ichida raqami bir xil ("012" = "12").
  "inactive" (sotuvdan olingan) xonadonlarga tegilmaydi.
*/

const TO_SITE: Partial<Record<ShStatus, string>> = { free: "Bo'sh", hold: 'Bronlangan', sold: 'Band' };

const norm = (s: string) => s.toLowerCase().replace(/['‘’`ʻ]/g, '').replace(/[\s_-]+/g, ' ').replace(/\bblok\b/g, '').trim();
const blockNum = (s: string) => { const m = s.match(/\d+/); return m ? Number(m[0]) : null; };
const aptKey = (n: string) => n.trim().replace(/^0+(?=\d)/, '').toLowerCase();

type SiteProject = { id: number; name_uz: string; block_no: number | null };
type SiteApt = { id: number; project_id: number; number: string; status: string };

export type SyncReport = {
  at: string;
  blocks: { sh: ShBlock; siteProject: SiteProject | null; how: string; shCount: number; matched: number }[];
  changes: { aptId: number; project: string; number: string; from: string; to: string }[];
  notOnSite: number;      // Sale House'da bor, saytda yo'q xonadonlar
  notInSaleHouse: number; // moslangan loyihada saytda bor, Sale House'da yo'q
  unmatchedSiteProjects: string[];
};

async function loadMap(): Promise<Record<string, number>> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').get('_salehouse_map') as { value: string } | undefined;
  try { return row?.value ? JSON.parse(row.value) : {}; } catch { return {}; }
}

export async function buildReport(): Promise<SyncReport> {
  const [{ blocks, apartments }, manual] = await Promise.all([fetchSaleHouseInventory(), loadMap()]);
  const projects = await db.prepare('SELECT id, name_uz, block_no FROM projects').all() as SiteProject[];
  const siteApts = await db.prepare('SELECT id, project_id, number, status FROM apartments').all() as SiteApt[];

  const byShNum = new Map<number, number>();
  for (const b of blocks) { const n = blockNum(b.name); if (n != null) byShNum.set(n, (byShNum.get(n) || 0) + 1); }

  const match = (b: ShBlock): { p: SiteProject | null; how: string } => {
    if (manual[b.id] != null) return { p: projects.find((p) => p.id === Number(manual[b.id])) || null, how: "qo'lda" };
    const n = blockNum(b.name);
    if (n != null && byShNum.get(n) === 1) {
      const hits = projects.filter((p) => Number(p.block_no) === n);
      if (hits.length === 1) return { p: hits[0], how: 'blok raqami' };
    }
    const names = [norm(b.name), norm(`${b.projectName} ${b.name}`)];
    const byName = projects.filter((p) => names.includes(norm(p.name_uz)));
    if (byName.length === 1) return { p: byName[0], how: 'nomi' };
    return { p: null, how: 'topilmadi' };
  };

  const shByBlock = new Map<string, ShApartment[]>();
  for (const a of apartments) shByBlock.set(a.blockId, [...(shByBlock.get(a.blockId) || []), a]);

  const report: SyncReport = { at: new Date().toISOString(), blocks: [], changes: [], notOnSite: 0, notInSaleHouse: 0, unmatchedSiteProjects: [] };
  const usedProjects = new Set<number>();

  for (const b of blocks) {
    const { p, how } = match(b);
    const shList = shByBlock.get(b.id) || [];
    let matched = 0;
    if (p) {
      usedProjects.add(p.id);
      const site = new Map(siteApts.filter((a) => a.project_id === p.id).map((a) => [aptKey(String(a.number)), a]));
      const seen = new Set<string>();
      for (const a of shList) {
        const s = site.get(aptKey(a.number));
        if (!s) { report.notOnSite++; continue; }
        matched++;
        seen.add(aptKey(a.number));
        const to = TO_SITE[a.status];
        if (to && s.status !== to) report.changes.push({ aptId: s.id, project: p.name_uz, number: String(s.number), from: s.status, to });
      }
      report.notInSaleHouse += [...site.keys()].filter((k) => !seen.has(k)).length;
    } else {
      report.notOnSite += shList.length;
    }
    report.blocks.push({ sh: b, siteProject: p, how, shCount: shList.length, matched });
  }
  report.unmatchedSiteProjects = projects.filter((p) => !usedProjects.has(p.id)).map((p) => p.name_uz);
  return report;
}

/** Hisobotdagi o'zgarishlarni saytga yozadi (faqat sayt bazasi, faqat holat ustuni). */
export async function applyReport(report: SyncReport): Promise<number> {
  let n = 0;
  for (const c of report.changes) {
    const r = await db.prepare('UPDATE apartments SET status = ? WHERE id = ? AND status = ?').run(c.to, c.aptId, c.from);
    n += Number(r.changes) || 0;
  }
  const summary = JSON.stringify({ at: report.at, applied: n, changes: report.changes.length, notOnSite: report.notOnSite });
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_salehouse_last_sync', summary, summary);
  return n;
}
