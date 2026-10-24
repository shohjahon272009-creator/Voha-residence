import type { InArgs } from '@libsql/client';
import { hashPassword } from './password';

/*
  Ma'lumotlar bazasi — ikki rejimli, chidamli:

  • TURSO_DATABASE_URL + TURSO_AUTH_TOKEN o'rnatilsa → bulutli Turso
    (@libsql/client/web, sof JS/HTTP). Vercel serverlessda doimiy saqlaydi.
  • Aks holda → mahalliy `qurilish.db` (better-sqlite3). Vercel'da ham o'qish
    ishlaydi (fayl /tmp ga nusxalanadi), shuning uchun sayt hech qachon 500
    bermaydi — Turso sozlanmagan bo'lsa ham kamida ko'rsatadi.

  API async: db.prepare(sql).get/all/run(...) → Promise. Turso: DEPLOY.md.
*/

type Row = Record<string, unknown>;
type RunResult = { changes: number; lastInsertRowid: number | bigint | undefined };

interface Backend {
  all(sql: string, args: unknown[]): Promise<Row[]>;
  get(sql: string, args: unknown[]): Promise<Row | undefined>;
  run(sql: string, args: unknown[]): Promise<RunResult>;
  exec(sql: string): Promise<void>;
}

const globalForDb = globalThis as unknown as { __qurilishBackend?: Promise<Backend> };

async function makeTursoBackend(): Promise<Backend> {
  const { createClient } = await import('@libsql/client/web');
  // libsql:// (WebSocket) serverlessda ishlamaydi — https:// (HTTP) ishlatamiz.
  const url = (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
  const c = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  const norm = (a: unknown[]) => a.map((x) => (x === undefined ? null : x)) as InArgs;
  return {
    async all(sql, args) {
      return (await c.execute({ sql, args: norm(args) })).rows as unknown as Row[];
    },
    async get(sql, args) {
      return (await c.execute({ sql, args: norm(args) })).rows[0] as Row | undefined;
    },
    async run(sql, args) {
      const r = await c.execute({ sql, args: norm(args) });
      return {
        changes: Number(r.rowsAffected),
        lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
      };
    },
    async exec(sql) {
      await c.executeMultiple(sql);
    },
  };
}

async function makeLocalBackend(): Promise<Backend> {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const path = require('path');
  const fs = require('fs');
  const Database = require('better-sqlite3');
  /* eslint-enable @typescript-eslint/no-require-imports */
  let dbPath = path.join(process.cwd(), 'qurilish.db');
  if (process.env.VERCEL) {
    try {
      const tmp = path.join('/tmp', 'qurilish.db');
      if (fs.existsSync(dbPath) && !fs.existsSync(tmp)) fs.copyFileSync(dbPath, tmp);
      if (fs.existsSync(tmp)) dbPath = tmp;
    } catch { /* eng yomon holatda cwd fayli */ }
  }
  const bs = new Database(dbPath);
  try { bs.pragma('journal_mode = WAL'); } catch { /* muhim emas */ }
  return {
    async all(sql, args) { return bs.prepare(sql).all(...args) as Row[]; },
    async get(sql, args) { return bs.prepare(sql).get(...args) as Row | undefined; },
    async run(sql, args) {
      const r = bs.prepare(sql).run(...args);
      return {
        changes: Number(r.changes),
        lastInsertRowid: typeof r.lastInsertRowid === 'bigint' ? Number(r.lastInsertRowid) : r.lastInsertRowid,
      };
    },
    async exec(sql) { bs.exec(sql); },
  };
}

function getBackend(): Promise<Backend> {
  if (globalForDb.__qurilishBackend) return globalForDb.__qurilishBackend;
  const p = (async () => {
    const backend = process.env.TURSO_DATABASE_URL ? await makeTursoBackend() : await makeLocalBackend();
    await initSchema(backend);
    return backend;
  })();
  globalForDb.__qurilishBackend = p;
  // Vaqtinchalik xato (tarmoq, Turso) bo'lsa keshdan o'chiramiz — aks holda bu server nusxasi
  // keyingi barcha so'rovlarda ham o'sha rad etilgan promise'ni qaytarib, 500 berardi.
  p.catch(() => { if (globalForDb.__qurilishBackend === p) globalForDb.__qurilishBackend = undefined; });
  return p;
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

// Ustun yo'q bo'lsa qo'shadi; yangi qo'shilgan bo'lsa true qaytaradi (bir martalik to'ldirish uchun)
async function ensureColumn(b: Backend, table: string, column: string, definition: string): Promise<boolean> {
  const cols = await b.all(`PRAGMA table_info(${table})`, []);
  if (!cols.some((c) => c.name === column)) {
    try {
      await b.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (e) {
      // Bir vaqtda ishga tushgan boshqa server nusxasi ustunni allaqachon qo'shgan — bu xato emas
      if (/duplicate column/i.test(String((e as Error)?.message))) return false;
      throw e;
    }
    return true;
  }
  return false;
}

async function initSchema(b: Backend): Promise<void> {
  for (const ddl of TABLE_DDLS) await b.exec(ddl);
  await ensureColumn(b, 'projects', 'apts_per_floor', 'INTEGER DEFAULT 4');
  await ensureColumn(b, 'projects', 'days_left', 'INTEGER DEFAULT 0');
  await ensureColumn(b, 'projects', 'virtual_tour_url', 'TEXT');
  await ensureColumn(b, 'projects', 'tour_scenes', 'TEXT');
  await ensureColumn(b, 'projects', 'discount_label', 'TEXT');
  await ensureColumn(b, 'projects', 'gift_label', 'TEXT');
  await ensureColumn(b, 'projects', 'categories', 'TEXT');
  await ensureColumn(b, 'projects', 'delivery_year', 'INTEGER');
  // Loyiha "sotib tugatilgan" bayrog'i — endi xonadon holatidan emas, admin belgilaydi
  await ensureColumn(b, 'projects', 'is_sold_out', 'INTEGER DEFAULT 0');
  // To'lov qoidalari uchun blok raqami (ipoteka/qat'iy boshlang'ich bloklari). Avval loyiha NOMIDAN
  // olinardi ("10-blok" -> 10) — nom o'zgartirilsa xaridor shartlari jimgina o'zgarib ketardi.
  if (await ensureColumn(b, 'projects', 'block_no', 'INTEGER')) {
    await b.run('UPDATE projects SET block_no = CAST(name_uz AS INTEGER) WHERE CAST(name_uz AS INTEGER) > 0', []);
  }
  await ensureColumn(b, 'apartments', 'image', 'TEXT');
  // Sessiyani bekor qilish uchun: parol almashtirilsa yoki chiqilsa oshiriladi
  await ensureColumn(b, 'users', 'session_version', 'INTEGER DEFAULT 0');
  // Rasm bor-yo'qligi bayroqlari: ro'yxatlarda katta base64 ustunlarni (75 MB+) o'qimaslik uchun.
  // Bir marta to'ldiriladi, keyin adminActions yozganda yangilaydi.
  const addedPlan = await ensureColumn(b, 'apartments', 'has_plan', 'INTEGER DEFAULT 0');
  const addedPhoto = await ensureColumn(b, 'apartments', 'has_photo', 'INTEGER DEFAULT 0');
  if (addedPlan || addedPhoto) {
    await b.run(
      'UPDATE apartments SET has_plan = (COALESCE(LENGTH(plan_image), 0) > 0), has_photo = (COALESCE(LENGTH(image), 0) > 0)',
      [],
    );
  }
  // Spamga qarshi limit uchun — so'rov qaysi IP'dan kelgani
  await ensureColumn(b, 'bookings', 'ip', 'TEXT');

  const users = await b.get('SELECT count(*) as count FROM users', []);
  if (Number((users as Row)?.count) > 0) return;

  // Birinchi admin: parol env'dan (INITIAL_ADMIN_PASSWORD). Production'da env bo'lmasa — hech kim yaratilmaydi:
  // ochiq repoda yozilgan "admin123" bilan istalgan odam kira olardi. Lokal ishlab chiqishda — admin123.
  const initialPassword =
    process.env.INITIAL_ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123');
  if (!initialPassword) {
    console.error("Foydalanuvchilar jadvali bo'sh: INITIAL_ADMIN_PASSWORD env'ini o'rnating va qayta ishga tushiring.");
    return;
  }
  await b.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
    'Admin', process.env.INITIAL_ADMIN_EMAIL || 'admin@qurilish.uz', hashPassword(initialPassword), 'superadmin',
  ]);
  const projects = [
    { name_uz: 'Oltin Vodiy', name_ru: 'Золотая Долина', name_en: 'Golden Valley', address: 'Amir Temur ko\'chasi', city: 'Xorazm', district: 'Urganch', status: 'Jarayonda', min_price: 800000000, total_floors: 12 },
    { name_uz: 'Crystal Tower', name_ru: 'Кристальная Башня', name_en: 'Crystal Tower', address: 'Xonqa ko\'chasi', city: 'Xorazm', district: 'Urganch', status: 'Tez kunda', min_price: 1200000000, total_floors: 16 },
  ];
  for (const p of projects) {
    const r = await b.run(
      'INSERT INTO projects (name_uz, name_ru, name_en, address, city, district, status, min_price, total_floors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.name_uz, p.name_ru, p.name_en, p.address, p.city, p.district, p.status, p.min_price, p.total_floors],
    );
    const pid = Number(r.lastInsertRowid);
    for (let floor = 1; floor <= p.total_floors; floor++) {
      for (let num = 1; num <= 2; num++) {
        await b.run(
          'INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [pid, floor, `${floor}0${num}`, (num % 2) + 1, 45 + num * 10, p.min_price + num * 50000000, num % 2 === 0 ? 'Band' : "Bo'sh"],
        );
      }
    }
  }
}

// --- better-sqlite3 ga o'xshash ASYNC API ---
const db = {
  prepare(sql: string) {
    return {
      get: async (...args: unknown[]) => (await getBackend()).get(sql, args),
      all: async (...args: unknown[]) => (await getBackend()).all(sql, args),
      run: async (...args: unknown[]) => (await getBackend()).run(sql, args),
    };
  },
  exec: async (sql: string) => (await getBackend()).exec(sql),
};

export default db;
