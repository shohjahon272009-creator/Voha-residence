 
 
 
 
 
import Database from 'better-sqlite3';
import path from 'path';
import { hashPassword } from './password';

// Reuse a single connection across hot-reloads in development. Without this,
// Next.js re-evaluates this module on every change and opens a new SQLite
// handle each time, eventually exhausting file handles / locking the file.
const globalForDb = globalThis as unknown as { __qurilishDb?: Database.Database };

const dbPath = path.join(process.cwd(), 'qurilish.db');
const db = globalForDb.__qurilishDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== 'production') globalForDb.__qurilishDb = db;

// Stability: WAL lets readers and a writer work concurrently without blocking, and
// busy_timeout makes a locked DB wait instead of throwing SQLITE_BUSY — which
// otherwise can crash Next.js render workers ("Jest worker child process exceptions")
// when the dev server and a script touch the file at the same time.
try {
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
} catch { /* pragmas are best-effort */ }

// Project table DDL is kept in a const so the migration below can rebuild the
// table with the same definition when an older status CHECK is detected.
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
    gallery TEXT, -- JSON array of images
    lat REAL,
    lng REAL,
    amenities TEXT, -- JSON array of keys (lift, garage, etc)
    apts_per_floor INTEGER DEFAULT 4,
    days_left INTEGER DEFAULT 0,
    virtual_tour_url TEXT,
    tour_scenes TEXT
  );
`;

// Apartments DDL is also kept in a const so the repair migration below can
// rebuild the table with a correct foreign key reference.
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

// Initialize schema
db.exec(PROJECTS_DDL);
db.exec(APARTMENTS_DDL);
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
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
  );

  CREATE TABLE IF NOT EXISTS news (
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
  );

  CREATE TABLE IF NOT EXISTS sliders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT,
    title_ru TEXT,
    title_en TEXT,
    image TEXT,
    link TEXT,
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('superadmin', 'menejer', 'operator'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Lightweight migrations for databases created before a column existed.
// CREATE TABLE IF NOT EXISTS never alters an existing table, so add columns here.
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

// Older databases were created with a status CHECK that rejects the
// 'Sanoqli kunlar qoldi' status (offered in the admin UI). SQLite can't alter a
// CHECK constraint in place, so rebuild the table when the stale one is found.
const projectsSql =
  (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'").get() as
    | { sql?: string }
    | undefined)?.sql ?? '';

if (projectsSql.includes('CHECK') && !projectsSql.includes('Sanoqli kunlar qoldi')) {
  const PROJECT_COLUMNS =
    'id, name_uz, name_ru, name_en, description_uz, description_ru, description_en, ' +
    'address, city, district, status, min_price, total_floors, main_image, gallery, ' +
    'lat, lng, amenities, apts_per_floor, days_left, virtual_tour_url, tour_scenes';

  db.pragma('foreign_keys = OFF');
  // legacy_alter_table keeps RENAME from rewriting foreign keys in OTHER tables
  // (e.g. apartments -> projects); without it, dropping projects_legacy later
  // leaves those FKs pointing at a non-existent table.
  db.pragma('legacy_alter_table = ON');
  db.transaction(() => {
    db.exec('ALTER TABLE projects RENAME TO projects_legacy');
    db.exec(PROJECTS_DDL);
    db.exec(`INSERT INTO projects (${PROJECT_COLUMNS}) SELECT ${PROJECT_COLUMNS} FROM projects_legacy`);
    db.exec('DROP TABLE projects_legacy');
  })();
  db.pragma('legacy_alter_table = OFF');
  db.pragma('foreign_keys = ON');
}

// Repair: an earlier projects rebuild (without legacy_alter_table) rewrote the
// apartments foreign key to reference the dropped "projects_legacy" table, which
// breaks DELETE FROM apartments (and therefore deleting a project). Rebuild the
// apartments table with the correct reference if this damage is detected.
const apartmentsSql =
  (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='apartments'").get() as
    | { sql?: string }
    | undefined)?.sql ?? '';

if (apartmentsSql.includes('projects_legacy')) {
  const APARTMENT_COLUMNS =
    'id, project_id, floor, number, rooms, area, price_cash, price_installment, ' +
    'status, plan_image, image, orientation, note';

  db.pragma('foreign_keys = OFF');
  db.pragma('legacy_alter_table = ON'); // don't rewrite the bookings -> apartments FK
  db.transaction(() => {
    db.exec('ALTER TABLE apartments RENAME TO apartments_broken');
    db.exec(APARTMENTS_DDL);
    db.exec(`INSERT INTO apartments (${APARTMENT_COLUMNS}) SELECT ${APARTMENT_COLUMNS} FROM apartments_broken`);
    db.exec('DROP TABLE apartments_broken');
  })();
  db.pragma('legacy_alter_table = OFF');
  db.pragma('foreign_keys = ON');
}

// Self-seeding logic
const seed = () => {
  const users = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (users.count > 0) return;

  console.log('Seeding database...');

  // 1. Create Admin User (default password: admin123 — change it after first login)
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@qurilish.uz', hashPassword('admin123'), 'superadmin');

  const projects = [
    {
      name_uz: 'Oltin Vodiy',
      name_ru: 'Золотая Долина',
      name_en: 'Golden Valley',
      address: 'Amir Temur ko\'chasi',
      city: 'Xorazm',
      district: 'Urganch',
      status: 'Jarayonda',
      min_price: 800000000,
      total_floors: 12
    },
    {
      name_uz: 'Crystal Tower',
      name_ru: 'Кристальная Башня',
      name_en: 'Crystal Tower',
      address: 'Xonqa ko\'chasi',
      city: 'Xorazm',
      district: 'Urganch',
      status: 'Tez kunda',
      min_price: 1200000000,
      total_floors: 16
    }
  ];

  const projectStmt = db.prepare(`
    INSERT INTO projects (name_uz, name_ru, name_en, address, city, district, status, min_price, total_floors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const aptStmt = db.prepare(`
    INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  projects.forEach(project => {
    const result = projectStmt.run(
      project.name_uz, project.name_ru, project.name_en, 
      project.address, project.city, project.district, 
      project.status, project.min_price, project.total_floors
    );
    const pid = result.lastInsertRowid;

    for (let floor = 1; floor <= project.total_floors; floor++) {
      for (let num = 1; num <= 2; num++) {
        const status = num % 2 === 0 ? 'Band' : "Bo'sh";
        aptStmt.run(pid as number, floor, `${floor}0${num}`, (num % 2) + 1, 45 + num * 10, project.min_price + num * 50000000, status);
      }
    }
  });

  console.log('Database seeded successfully!');
};

seed();

export default db;
