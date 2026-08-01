import Database from 'libsql';
import path from 'path';
import { hashPassword } from './password';

/*
  Ma'lumotlar bazasi — libSQL (SQLite bilan mos).

  • Lokal ishlab chiqishda: `qurilish.db` fayli ishlatiladi (avvalgidek).
  • Ishlab chiqarishda (Vercel): TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
    o'rnatilsa, to'g'ridan-to'g'ri Turso bulutli bazasiga ulanadi.
    Shunda admin paneldan kiritilgan o'zgarishlar DOIMIY saqlanadi
    (serverless disk vaqtinchalik bo'lsa ham).

  Turso sozlash bo'yicha: DEPLOY.md faylidagi "Turso" bo'limiga qarang.
  API better-sqlite3 bilan bir xil (sinxron), shuning uchun qolgan kod
  o'zgarishsiz ishlaydi.
*/

type LibsqlDb = InstanceType<typeof Database>;

const globalForDb = globalThis as unknown as { __qurilishDb?: LibsqlDb };

function createDb(): LibsqlDb {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && url.startsWith('libsql://')) {
    // Bulutli Turso (serverless uchun — yozuvlar doimiy saqlanadi).
    // libsql tip ta'rifida remote `authToken` yo'q, lekin runtime qo'llab-quvvatlaydi.
    const opts = { authToken } as unknown as ConstructorParameters<typeof Database>[1];
    return new Database(url, opts);
  }
  // Lokal fayl (ishlab chiqish rejimi)
  return new Database(path.join(process.cwd(), 'qurilish.db'));
}

const rawDb: LibsqlDb = globalForDb.__qurilishDb ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.__qurilishDb = rawDb;

// libSQL .get() natijasiga xizmatchi `_metadata` maydonini qo'shadi —
// uni mijozga yubormaslik uchun olib tashlaymiz.
function strip<T>(row: T): T {
  if (row && typeof row === 'object' && '_metadata' in (row as Record<string, unknown>)) {
    const clone = { ...(row as Record<string, unknown>) };
    delete clone._metadata;
    return clone as T;
  }
  return row;
}

// better-sqlite3 bilan bir xil sinxron API (prepare/get/all/run/exec/pragma/transaction).
const db = {
  prepare(sql: string) {
    const stmt = rawDb.prepare(sql);
    return {
      get: (...args: unknown[]) => strip(stmt.get(...args)),
      all: (...args: unknown[]) => (stmt.all(...args) as unknown[]).map(strip),
      run: (...args: unknown[]) => {
        const r = stmt.run(...args) as { changes: number; lastInsertRowid: number | bigint };
        return {
          changes: Number(r.changes),
          lastInsertRowid:
            typeof r.lastInsertRowid === 'bigint' ? Number(r.lastInsertRowid) : r.lastInsertRowid,
        };
      },
    };
  },
  exec: (sql: string) => rawDb.exec(sql),
  pragma: (p: string) => {
    try {
      return rawDb.pragma(p);
    } catch {
      return undefined; // ba'zi pragmalar Turso'da qo'llab-quvvatlanmaydi — muhim emas
    }
  },
  transaction: <T>(fn: (...a: unknown[]) => T) => rawDb.transaction(fn),
};

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// --- SXEMA ---
const PROJECTS_DDL = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    description_en TEXT,
    address TEXT,
    city TEXT,
    district TEXT,
    status TEXT CHECK(status IN ('Jarayonda', 'Topshirilgan', 'Tez kunda', 'Sanoqli kunlar qoldi')),
    min_price REAL,
    total_floors INTEGER,
    main_image TEXT,
    gallery TEXT,
    lat REAL,
    lng REAL,
    amenities TEXT,
    apts_per_floor INTEGER DEFAULT 4,
    days_left INTEGER DEFAULT 0,
    virtual_tour_url TEXT,
    tour_scenes TEXT
  );
`;

const APARTMENTS_DDL = `
  CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    floor INTEGER,
    number TEXT,
    rooms INTEGER,
    area REAL,
    price_cash REAL,
    price_installment REAL,
    status TEXT CHECK(status IN ('Bo''sh', 'Band', 'Bronlangan')),
    plan_image TEXT,
    image TEXT,
    orientation TEXT,
    note TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`;

// Har bir jadvalni alohida yaratamiz — remote Turso ko'p-ifodali exec bilan
// ishonchsiz bo'lishi mumkin. IF NOT EXISTS tufayli mavjud bazaga ta'sir qilmaydi.
const TABLE_DDLS = [
  PROJECTS_DDL,
  APARTMENTS_DDL,
  `CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apartment_id INTEGER,
    client_name TEXT,
    client_phone TEXT,
    payment_type TEXT,
    status TEXT CHECK(status IN ('Yangi', 'Ko''rib chiqilmoqda', 'Tasdiqlangan', 'Bekor qilingan')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    manager_id INTEGER,
    note TEXT,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
  );`,
  `CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT,
    title_ru TEXT,
    title_en TEXT,
    content_uz TEXT,
    content_ru TEXT,
    content_en TEXT,
    image TEXT,
    category TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    visible INTEGER DEFAULT 1
  );`,
  `CREATE TABLE IF NOT EXISTS sliders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT,
    title_ru TEXT,
    title_en TEXT,
    image TEXT,
    link TEXT,
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('superadmin', 'menejer', 'operator'))
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );`,
];

for (const ddl of TABLE_DDLS) {
  db.exec(ddl);
}

// CREATE TABLE IF NOT EXISTS mavjud jadvalni o'zgartirmaydi — yetishmayotgan
// ustunlarni shu yerda qo'shamiz.
const ensureColumn = (table: string, column: string, definition: string) => {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

ensureColumn('projects', 'apts_per_floor', 'INTEGER DEFAULT 4');
ensureColumn('projects', 'days_left', 'INTEGER DEFAULT 0');
ensureColumn('projects', 'virtual_tour_url', 'TEXT');
ensureColumn('projects', 'tour_scenes', 'TEXT');
ensureColumn('apartments', 'image', 'TEXT');

// --- SEED (faqat bo'sh bazada) ---
const seed = () => {
  const users = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (users.count > 0) return;

  console.log('Seeding database...');

  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@qurilish.uz', hashPassword('admin123'), 'superadmin');

  const projects = [
    {
      name_uz: 'Oltin Vodiy', name_ru: 'Золотая Долина', name_en: 'Golden Valley',
      address: 'Amir Temur ko\'chasi', city: 'Xorazm', district: 'Urganch',
      status: 'Jarayonda', min_price: 800000000, total_floors: 12,
    },
    {
      name_uz: 'Crystal Tower', name_ru: 'Кристальная Башня', name_en: 'Crystal Tower',
      address: 'Xonqa ko\'chasi', city: 'Xorazm', district: 'Urganch',
      status: 'Tez kunda', min_price: 1200000000, total_floors: 16,
    },
  ];

  const projectStmt = db.prepare(`
    INSERT INTO projects (name_uz, name_ru, name_en, address, city, district, status, min_price, total_floors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const aptStmt = db.prepare(`
    INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  projects.forEach((project) => {
    const result = projectStmt.run(
      project.name_uz, project.name_ru, project.name_en,
      project.address, project.city, project.district,
      project.status, project.min_price, project.total_floors,
    );
    const pid = result.lastInsertRowid as number;
    for (let floor = 1; floor <= project.total_floors; floor++) {
      for (let num = 1; num <= 2; num++) {
        const status = num % 2 === 0 ? 'Band' : "Bo'sh";
        aptStmt.run(pid, floor, `${floor}0${num}`, (num % 2) + 1, 45 + num * 10, project.min_price + num * 50000000, status);
      }
    }
  });

  console.log('Database seeded successfully!');
};

seed();

export default db;
