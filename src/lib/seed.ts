 
 
 
 
 
import db from './db';

const seed = () => {
  // Check if already seeded
  const users = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (users.count > 0) return;

  // 1. Create Admin User (Password: admin123)
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@qurilish.uz', 'admin123', 'superadmin');

  // 2. Create a Project
  const projectResult = db.prepare(`
    INSERT INTO projects (name_uz, name_ru, name_en, address, city, district, status, min_price, total_floors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Oltin Vodiy',
    'Золотая Долина',
    'Golden Valley',
    'Amir Temur ko\'chasi',
    'Xorazm',
    'Urganch',
    'Jarayonda',
    800000000,
    12
  );

  const projectId = projectResult.lastInsertRowid;

  // 3. Create Apartments
  const stmt = db.prepare(`
    INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let floor = 1; floor <= 12; floor++) {
    for (let num = 1; num <= 4; num++) {
      const status = num % 4 === 0 ? 'Band' : (num % 5 === 0 ? 'Bronlangan' : 'Bo\'sh');
      stmt.run(projectId, floor, `${floor}0${num}`, (num % 2) + 1, 45 + num * 10, 800000000 + num * 50000000, status);
    }
  }

  console.log('Database seeded successfully!');
};

seed();
