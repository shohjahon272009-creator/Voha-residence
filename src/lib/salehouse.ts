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
  return Boolean(process.env.SALEHOUSE_API_URL && process.env.SALEHOUSE_API_TOKEN);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function client() {
  const base = (process.env.SALEHOUSE_API_URL || '').replace(/\/+$/, '');
  const root = /\/api\/v1\/inventory$/.test(base) ? base : `${base}/api/v1/inventory`;
  const token = process.env.SALEHOUSE_API_TOKEN || '';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.SALEHOUSE_AUTH_HEADER) headers[process.env.SALEHOUSE_AUTH_HEADER] = token;
  else headers.Authorization = `Bearer ${token}`;
  const hide = (s: string) => (token ? s.split(token).join('***') : s);

  let last = 0;
  // Yagona ruxsat etilgan usul — GET
  return async function get(path: string): Promise<unknown> {
    const wait = last + PACE_MS - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
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
  const companies = (process.env.SALEHOUSE_COMPANY_ID || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ours = (r: Record<string, unknown>) => !companies.length || r.company_id == null || companies.includes(String(r.company_id));

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
          status: STATUS[String(a.status ?? '').trim().toLowerCase()] ?? 'inactive',
        });
      }
    }
  }
  return { blocks, apartments };
}
