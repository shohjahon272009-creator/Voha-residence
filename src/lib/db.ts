import type { Client, InArgs } from '@libsql/client';
import { hashPassword } from './password';

/*
  Ma'lumotlar bazasi — libSQL / Turso.

  • TURSO_DATABASE_URL (libsql://...) + TURSO_AUTH_TOKEN o'rnatilsa — `@libsql/client/web`
    (SOF JavaScript, HTTP — native modul YO'Q) orqali bulutli Turso'ga ulanadi.
    Vercel serverlessда to'liq ishlaydi va admin o'zgarishlari DOIMIY saqlanadi.
  • Aks holda — lokal `qurilish.db` fayli (ishlab chiqish rejimi, native drayver).

  Client dinamik import qilinadi: Vercel'da faqat web (native'siz) versiya yuklanadi.
  API async: db.prepare(sql).get/all/run(...) — hammasi Promise qaytaradi.
  Turso sozlash: DEPLOY.md -> "Vercel + Turso".
*/

const globalForDb = globalThis as unknown as { __qurilishClientP?: Promise<Client> };

function getClient(): Promise<Client> {
  if (globalForDb.__qurilishClientP) return globalForDb.__qurilishClientP;
  const p = (async (): Promise<Client> => {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (url) {
      // Bulut: sof JS web client (Vercel serverless uchun xavfsiz — native yo'q)
      const { createClient } = await import('@libsql/client/web');
      return createClient({ url, authToken });
    }
    // Lokal fayl: node client (native drayver — faqat ishlab chiqishда)
    const { createClient } = await import('@libsql/client');
    return createClient({ url: 'file:qurilish.db' });
  })();
  globalForDb.__qurilishClientP = p;
  return p;
}

type Row = Record<string, unknown>;
type RunResult = { changes: number; lastInsertRowid: number | bigint | undefined };

// undefined -> null (libsql undefined argumentni qabul qilmaydi)
function normArgs(args: unknown[]): InArgs {
  return args.map((a) => (a === undefined ? null : a)) as InArgs;
}

// --- Sxema init + seed (bir marta, async) ---
let initPromise: Promise<void> | null = null;
function ensureInit(): Promise<void> {
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

const TABLE_DDLS = [
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_uz TEXT NOT NULL, name_ru TEXT NOT NULL, name_en TEXT NOT NULL,
    description_uz TEXT, description_ru TEXT, description_en TEXT,
    address TEXT, city TEXT, district TEXT,
    status TEXT CHECK(status IN ('Jarayonda', 'Topshirilgan', 'Tez kunda', 'Sanoqli kunlar qoldi')),
    min_price REAL, total_floors INTEGER, main_image TEXT, gallery TEXT,
    lat REAL, lng REAL, amenities TEXT,
    apts_per_floor INTEGER DEFAULT 4, days_left INTEGER DEFAULT 0,
    virtual_tour_url TEXT, tour_scenes TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER, floor INTEGER, number TEXT, rooms INTEGER, area REAL,
    price_cash REAL, price_installment REAL,
    status TEXT CHECK(status IN ('Bo''sh', 'Band', 'Bronlangan')),
    plan_image TEXT, image TEXT, orientation TEXT, note TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apartment_id INTEGER, client_name TEXT, client_phone TEXT, payment_type TEXT,
    status TEXT CHECK(status IN ('Yangi', 'Ko''rib chiqilmoqda', 'Tasdiqlangan', 'Bekor qilingan')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, manager_id INTEGER, note TEXT,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
  );`,
  `CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT, title_ru TEXT, title_en TEXT,
    content_uz TEXT, content_ru TEXT, content_en TEXT,
    image TEXT, category TEXT, date DATETIME DEFAULT CURRENT_TIMESTAMP, visible INTEGER DEFAULT 1
  );`,
  `CREATE TABLE IF NOT EXISTS sliders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT, title_ru TEXT, title_en TEXT, image TEXT, link TEXT,
    active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT UNIQUE, password TEXT,
    role TEXT CHECK(role IN ('superadmin', 'menejer', 'operator'))
  );`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`,
];

async function ensureColumn(c: Client, table: string, column: string, definition: string) {
  const res = await c.execute(`PRAGMA table_info(${table})`);
  if (!res.rows.some((r) => (r as Row).name === column)) {
    await c.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function doInit(): Promise<void> {
  const c = await getClient();
  for (const ddl of TABLE_DDLS) {
    await c.execute(ddl);
  }
  await ensureColumn(c, 'projects', 'apts_per_floor', 'INTEGER DEFAULT 4');
  await ensureColumn(c, 'projects', 'days_left', 'INTEGER DEFAULT 0');
  await ensureColumn(c, 'projects', 'virtual_tour_url', 'TEXT');
  await ensureColumn(c, 'projects', 'tour_scenes', 'TEXT');
  await ensureColumn(c, 'apartments', 'image', 'TEXT');

  // Seed (faqat bo'sh bazada)
  const users = await c.execute('SELECT count(*) as count FROM users');
  if (Number((users.rows[0] as Row).count) > 0) return;

  console.log('Seeding database...');
  await c.execute({
    sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    args: ['Admin', 'admin@qurilish.uz', hashPassword('admin123'), 'superadmin'],
  });

  const projects = [
    { name_uz: 'Oltin Vodiy', name_ru: 'Золотая Долина', name_en: 'Golden Valley', address: 'Amir Temur ko\'chasi', city: 'Xorazm', district: 'Urganch', status: 'Jarayonda', min_price: 800000000, total_floors: 12 },
    { name_uz: 'Crystal Tower', name_ru: 'Кристальная Башня', name_en: 'Crystal Tower', address: 'Xonqa ko\'chasi', city: 'Xorazm', district: 'Urganch', status: 'Tez kunda', min_price: 1200000000, total_floors: 16 },
  ];
  for (const p of projects) {
    const r = await c.execute({
      sql: 'INSERT INTO projects (name_uz, name_ru, name_en, address, city, district, status, min_price, total_floors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [p.name_uz, p.name_ru, p.name_en, p.address, p.city, p.district, p.status, p.min_price, p.total_floors],
    });
    const pid = Number(r.lastInsertRowid);
    for (let floor = 1; floor <= p.total_floors; floor++) {
      for (let num = 1; num <= 2; num++) {
        const status = num % 2 === 0 ? 'Band' : "Bo'sh";
        await c.execute({
          sql: 'INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [pid, floor, `${floor}0${num}`, (num % 2) + 1, 45 + num * 10, p.min_price + num * 50000000, status],
        });
      }
    }
  }
  console.log('Database seeded successfully!');
}

// --- better-sqlite3 ga o'xshash, lekin ASYNC API ---
const db = {
  prepare(sql: string) {
    return {
      get: async (...args: unknown[]): Promise<Row | undefined> => {
        await ensureInit();
        const c = await getClient();
        const r = await c.execute({ sql, args: normArgs(args) });
        return r.rows[0] as Row | undefined;
      },
      all: async (...args: unknown[]): Promise<Row[]> => {
        await ensureInit();
        const c = await getClient();
        const r = await c.execute({ sql, args: normArgs(args) });
        return r.rows as unknown as Row[];
      },
      run: async (...args: unknown[]): Promise<RunResult> => {
        await ensureInit();
        const c = await getClient();
        const r = await c.execute({ sql, args: normArgs(args) });
        return {
          changes: Number(r.rowsAffected),
          lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
        };
      },
    };
  },
  exec: async (sql: string): Promise<void> => {
    await ensureInit();
    const c = await getClient();
    await c.executeMultiple(sql);
  },
};

export default db;
