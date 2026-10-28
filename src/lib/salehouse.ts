/*
  Sale House Inventory API v1 — FAQAT O'QISH (GET). Bu faylda yozish (POST/PATCH/PUT/DELETE)
  so'rovi umuman yo'q: sayt Sale House'da hech narsani o'zgartira olmaydi.

  Kalit faqat serverdagi .env.local'da (SALEHOUSE_API_URL, SALEHOUSE_API_TOKEN, ixtiyoriy
  SALEHOUSE_AUTH_HEADER, SALEHOUSE_COMPANY_ID). Kodga, gitga va brauzerga tushmaydi; xato
  matnlarida ham kalit yashiriladi.

  Sale House chegarasi daqiqasiga 120 so'rov va uni Sale House boti ham ishlatadi —
  shuning uchun so'rovlar orasida pauza (daqiqasiga ~60 tadan oshmaydi).
*/

export type ShStatus = 'free' | 'hold' | 'sold' | 'inactive';
export type ShApartment = {
  id: string;
  blockId: string;
  blockName: string;
  projectName: string;
  number: string;
  floor: number | null;
  rooms: number | null;
  area: number | null;
  status: ShStatus;
};
export type ShBlock = { id: string; name: string; projectName: string };

const TIMEOUT_MS = 15_000;
const PACE_MS = 1_000;
const PER_PAGE = 100;

const STATUS: Record<string, ShStatus> = {
  available: 'free', free: 'free',
  reserved: 'hold', hold: 'hold', booked: 'hold',
  sold: 'sold',
  inactive: 'inactive',
};

export function salehouseConfigured(): boolean {
  return Boolean((process.env.SALEHOUSE_API_URL && process.env.SALEHOUSE_API_TOKEN) || fixturePath());
}

// Faqat lokal sinov uchun: Turso'siz (qurilish.db) nusxada Sale House javobi o'rniga JSON fayl
const fixturePath = () => (!process.env.TURSO_DATABASE_URL && process.env.SALEHOUSE_FIXTURE) || '';
export function salehouseFixture(): Promise<{ blocks: ShBlock[]; apartments: ShApartment[] }> | null {
  const p = fixturePath();
  if (!p) return null;
  return import('fs').then((fs) => JSON.parse(fs.readFileSync(p, 'utf8')));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Butun jarayon uchun YAGONA navbat: qo'lda hisobot va avtomatik sinxron bir vaqtda ishlasa ham
// Sale House'ga sekundiga 1 tadan ortiq so'rov ketmaydi (limitni bot bilan bo'lishamiz)
let nextSlot = 0;
async function takeSlot() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + PACE_MS;
  if (at > now) await sleep(at - now);
}

function client() {
  const base = (process.env.SALEHOUSE_API_URL || '').replace(/\/+$/, '');
  const root = /\/api\/v1\/inventory$/.test(base) ? base : `${base}/api/v1/inventory`;
  const token = process.env.SALEHOUSE_API_TOKEN || '';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.SALEHOUSE_AUTH_HEADER) headers[process.env.SALEHOUSE_AUTH_HEADER] = token;
  else headers.Authorization = `Bearer ${token}`;
  const hide = (s: string) => (token ? s.split(token).join('***') : s);

  // Yagona ruxsat etilgan usul — GET
  return async function get(path: string): Promise<unknown> {
    await takeSlot();
    for (let attempt = 1; ; attempt++) {
      let res: Response;
      try {
        res = await fetch(root + path, { method: 'GET', headers, cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
      } catch (e) {
        if (attempt < 3) { await sleep(1500); continue; }
        throw new Error(`Sale House bilan aloqa yo'q: ${(e as Error).name}`);
      }
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await sleep(Math.min(10, Number(res.headers.get('retry-after')) || 3) * 1000);
        continue;
      }
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(hide(`Sale House GET ${path}: ${res.status} ${(await res.text().catch(() => '')).slice(0, 160)}`));
      return res.json();
    }
  };
}

const unwrap = (body: unknown): Record<string, unknown>[] => {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  const b = body as { data?: unknown } | null;
  return Array.isArray(b?.data) ? (b!.data as Record<string, unknown>[]) : [];
};

/** Sale House'dagi barcha bloklar va xonadonlar (kompaniya filtri bilan). */
export async function fetchSaleHouseInventory(): Promise<{ blocks: ShBlock[]; apartments: ShApartment[] }> {
  const get = client();
  // Faqat Voha kompaniyasi (bitta Sale House'da boshqa kompaniyalar ham bor — ularning "5-blok"i
  // Voha loyihasiga yopishib qolmasin). SALEHOUSE_SITE_COMPANY_ID, bo'lmasa 1 (Voha Residence).
  const siteCompany = (process.env.SALEHOUSE_SITE_COMPANY_ID || '1').trim();
  const ours = (r: Record<string, unknown>) => r.company_id != null && String(r.company_id) === siteCompany;

  const listAll = async (path: string) => {
    const out: Record<string, unknown>[] = [];
    for (let page = 1; page <= 50; page++) {
      const body = await get(`${path}?page=${page}&per_page=${PER_PAGE}`);
      if (body === null) break;
      out.push(...unwrap(body));
      const lastPage = Number((body as { meta?: { last_page?: number } }).meta?.last_page || page);
      if (page >= lastPage) break;
    }
    return out;
  };

  const blocks: ShBlock[] = [];
  const apartments: ShApartment[] = [];
  for (const p of (await listAll('/projects')).filter(ours)) {
    for (const b of await listAll(`/projects/${p.id}/blocks`)) {
      const block: ShBlock = { id: String(b.id), name: String(b.name ?? ''), projectName: String(p.name ?? '') };
      blocks.push(block);
      for (const a of (await listAll(`/blocks/${b.id}/apartments`)).filter(ours)) {
        apartments.push({
          id: String(a.id),
          blockId: block.id,
          blockName: block.name,
          projectName: block.projectName,
          number: String(a.number ?? '').trim(),
          floor: a.floor == null ? null : Number(a.floor),
          rooms: a.rooms == null ? null : Number(a.rooms),
          // Narx maydonlari (price_per_sqm, total_price) ataylab olinmaydi — saytga narx tushmaydi
          area: a.area_sqm == null || a.area_sqm === '' ? null : Number(a.area_sqm),
          status: STATUS[String(a.status ?? '').trim().toLowerCase()] ?? 'inactive',
        });
      }
    }
  }
  return { blocks, apartments };
}
