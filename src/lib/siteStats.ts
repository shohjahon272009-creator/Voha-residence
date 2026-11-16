import db from '@/lib/db';

/*
  Admin "Sayt statistikasi" uchun ma'lumot. Har bir blok o'z manbasini aytadi va bitta davr
  (oxirgi N kun, UTC) bo'yicha hisoblanadi — raqamlar va grafik bir-biriga mos bo'lsin.
  Manba: sayt bazasi (bookings, apartments). amoCRM voronkasi — amocrm.ts'da, alohida.
*/

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];
export const toPeriod = (v: unknown): Period => (PERIODS.includes(Number(v) as Period) ? (Number(v) as Period) : 30);

export type DayCount = { day: string; total: number; apartment: number; general: number };

/** Kunlik arizalar (bo'sh kunlar 0 bilan to'ldiriladi). apartment — xonadon arizasi, general — umumiy murojaat. */
export async function leadsByDay(days: Period): Promise<DayCount[]> {
  const rows = await db.prepare(`
    SELECT date(created_at) AS day,
           COUNT(*) AS total,
           SUM(CASE WHEN apartment_id IS NOT NULL THEN 1 ELSE 0 END) AS apartment
    FROM bookings
    WHERE created_at >= datetime('now', ?)
    GROUP BY day
  `).all(`-${days} days`) as { day: string; total: number; apartment: number }[];
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: DayCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)).toISOString().slice(0, 10);
    const r = map.get(d);
    const total = Number(r?.total) || 0, apartment = Number(r?.apartment) || 0;
    out.push({ day: d, total, apartment, general: total - apartment });
  }
  return out;
}

/** Davrdagi arizalar sayt ichidagi holat bo'yicha (admin "Arizalar" sahifasidagi holatlar). */
export async function leadsByStatus(days: Period): Promise<{ status: string; n: number }[]> {
  const rows = await db.prepare(`
    SELECT COALESCE(status, 'Yangi') AS status, COUNT(*) AS n FROM bookings
    WHERE created_at >= datetime('now', ?) GROUP BY status
  `).all(`-${days} days`) as { status: string; n: number }[];
  return rows.map((r) => ({ status: r.status, n: Number(r.n) }));
}

export type ProjectStock = { id: number; name: string; free: number; reserved: number; sold: number; total: number };

/** Sotuvdagi bloklar bo'yicha xonadon holatlari — hozirgi holat (davrga bog'liq emas). Takroriy yozuvlar bir marta. */
export async function stockByProject(): Promise<ProjectStock[]> {
  const rows = await db.prepare(`
    SELECT p.id, p.name_uz AS name,
      COUNT(DISTINCT CASE WHEN a.status = 'Bo''sh' THEN a.floor || '|' || a.number END) AS free,
      COUNT(DISTINCT CASE WHEN a.status = 'Bronlangan' THEN a.floor || '|' || a.number END) AS reserved,
      COUNT(DISTINCT CASE WHEN a.status = 'Band' THEN a.floor || '|' || a.number END) AS sold
    FROM projects p LEFT JOIN apartments a ON a.project_id = p.id
    WHERE COALESCE(p.status, '') <> 'Topshirilgan'
    GROUP BY p.id ORDER BY p.name_uz
  `).all() as { id: number; name: string; free: number; reserved: number; sold: number }[];
  return rows.map((r) => {
    const free = Number(r.free), reserved = Number(r.reserved), sold = Number(r.sold);
    return { id: r.id, name: r.name, free, reserved, sold, total: free + reserved + sold };
  });
}
