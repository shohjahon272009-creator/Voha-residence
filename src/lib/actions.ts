 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import db from './db';
import { Project, Apartment } from './types';

export const getProjects = async (): Promise<Project[]> => {
  // Active/selling projects first, completed ("Topshirilgan") last; newest first within each group.
  // This way a newly added "Jarayonda" project shows at the top, and the earliest projects sit at the end.
  const projects = await db.prepare(`
    SELECT * FROM projects
    ORDER BY
      CASE status
        WHEN 'Jarayonda' THEN 1
        WHEN 'Sanoqli kunlar qoldi' THEN 2
        WHEN 'Tez kunda' THEN 3
        WHEN 'Topshirilgan' THEN 4
        ELSE 5
      END,
      id DESC
  `).all() as any[];
  return projects.map(p => ({
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
    amenities: p.amenities ? JSON.parse(p.amenities) : [],
    categories: p.categories ? JSON.parse(p.categories) : [],
    is_sold_out: Boolean(p.is_sold_out)
  }));
};

export const getProjectBySlug = async (id: number): Promise<Project | null> => {

  const p = await db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!p) return null;
  return {
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
    amenities: p.amenities ? JSON.parse(p.amenities) : [],
    categories: p.categories ? JSON.parse(p.categories) : [],
    is_sold_out: Boolean(p.is_sold_out)
  };
};

// Yengil ustunlar: og'ir base64 rasmlarni (75 MB+) HECH QACHON to'plamda tortmaymiz.
// Rasm bor-yo'qligini bilish uchun LENGTH() yetarli — rasmning o'zi /api/apt-image orqali beriladi.
const APT_LIST_COLS =
  'id, project_id, floor, number, rooms, area, price_cash, price_installment, status, orientation, note, ' +
  '(LENGTH(plan_image) > 0) AS has_plan, (LENGTH(image) > 0) AS has_photo';

// Har bir qatorni yengil ko'rinishga aylantiramiz: rasm o'rniga uni beruvchi manzil (URL).
// Shunday qilib sahifa ichiga 75 MB base64 joylashmaydi — sayt qotmaydi.
const toLight = (r: any): Apartment => {
  const { has_plan, has_photo, ...rest } = r;
  return {
    ...rest,
    plan_image: has_plan ? `/api/apt-image/${r.id}?t=plan` : '',
    image: has_photo ? `/api/apt-image/${r.id}?t=photo` : '',
  };
};

export const getApartments = async (projectId?: number): Promise<Apartment[]> => {
  const rows = projectId
    ? (await db.prepare(`SELECT ${APT_LIST_COLS} FROM apartments WHERE project_id = ?`).all(projectId) as any[])
    : (await db.prepare(`SELECT ${APT_LIST_COLS} FROM apartments`).all() as any[]);
  return rows.map(toLight);
};

export const getApartmentStats = async () => {
    const total = await db.prepare('SELECT count(*) as count FROM apartments').get() as { count: number };
    const available = await db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Bo'sh") as { count: number };
    const sold = await db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Band") as { count: number };
    const booked = await db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Bronlangan") as { count: number };

    return {
        total: total.count,
        available: available.count,
        sold: sold.count,
        booked: booked.count
    };
}
