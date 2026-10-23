 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import { cache } from 'react';
import db from './db';
import { Project, Apartment } from './types';
import { publicProjectMedia } from './media';

// Bazadagi JSON ro'yxat (gallery/amenities/categories). Buzilgan qiymat butun sahifani
// 500 bilan yiqitmasin — bo'sh ro'yxat qaytaramiz.
const parseList = (v: unknown): any[] => {
  if (!v || typeof v !== 'string') return [];
  try {
    const r = JSON.parse(v);
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
};

const PROJECT_ORDER = `
    ORDER BY
      CASE status
        WHEN 'Jarayonda' THEN 1
        WHEN 'Sanoqli kunlar qoldi' THEN 2
        WHEN 'Tez kunda' THEN 3
        WHEN 'Topshirilgan' THEN 4
        ELSE 5
      END,
      id DESC`;

const toProject = (p: any): Project => ({
  ...p,
  gallery: parseList(p.gallery),
  amenities: parseList(p.amenities),
  categories: parseList(p.categories),
  is_sold_out: Boolean(p.is_sold_out),
});

// cache: bitta so'rov ichida (bosh sahifa + ProjectsList) baza faqat bir marta so'raladi.
// Asl qiymatlar (base64 rasmlar bilan) — FAQAT admin uchun.
export const getProjects = cache(async (): Promise<Project[]> => {
  // Active/selling projects first, completed ("Topshirilgan") last; newest first within each group.
  // This way a newly added "Jarayonda" project shows at the top, and the earliest projects sit at the end.
  const projects = await db.prepare(`SELECT * FROM projects ${PROJECT_ORDER}`).all() as any[];
  return projects.map(toProject);
});

// Ommaviy sahifalar uchun yengil ustunlar: base64 rasm (data URL) o'rniga faqat 'data:' belgisi
// qaytadi — megabaytlab rasm bazadan har so'rovda tortilmaydi; publicProjectMedia uni /api/media
// manziliga aylantiradi (galereyada tartib raqami saqlanadi).
const LIGHT = (col: string) => `CASE WHEN substr(${col}, 1, 5) = 'data:' THEN 'data:' ELSE ${col} END AS ${col}`;
const PUBLIC_PROJECT_COLS = [
  'id', 'name_uz', 'name_ru', 'name_en', 'description_uz', 'description_ru', 'description_en',
  'address', 'city', 'district', 'status', 'min_price', 'total_floors', 'lat', 'lng', 'amenities',
  'apts_per_floor', 'days_left', 'tour_scenes', 'discount_label', 'gift_label', 'categories',
  'delivery_year', 'is_sold_out',
  LIGHT('main_image'), LIGHT('virtual_tour_url'),
  `(SELECT json_group_array(CASE WHEN substr(value, 1, 5) = 'data:' THEN 'data:' ELSE value END)
      FROM json_each(CASE WHEN json_valid(projects.gallery) THEN projects.gallery ELSE '[]' END)) AS gallery`,
].join(', ');

// Ommaviy sahifalar uchun: base64 rasmlar o'rniga /api/media manzillari (sahifa yengil bo'lsin).
// Admin sahifalari getProjects()/getProjectBySlug() ning asl qiymatlaridan foydalanadi.
export const getPublicProjects = cache(async (): Promise<Project[]> => {
  const rows = await db.prepare(`SELECT ${PUBLIC_PROJECT_COLS} FROM projects ${PROJECT_ORDER}`).all() as any[];
  return rows.map(toProject).map(publicProjectMedia);
});

// cache: generateMetadata va sahifa bir xil loyihani ikki marta so'ramasin
export const getPublicProjectBySlug = cache(async (id: number): Promise<Project | null> => {
  if (!Number.isInteger(id)) return null;
  const p = await db.prepare(`SELECT ${PUBLIC_PROJECT_COLS} FROM projects WHERE id = ?`).get(id) as any;
  return p ? publicProjectMedia(toProject(p)) : null;
});

export const getProjectBySlug = async (id: number): Promise<Project | null> => {

  const p = await db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!p) return null;
  return {
    ...p,
    gallery: parseList(p.gallery),
    amenities: parseList(p.amenities),
    categories: parseList(p.categories),
    is_sold_out: Boolean(p.is_sold_out)
  };
};

// Yengil ustunlar: og'ir base64 rasmlarni (75 MB+) HECH QACHON to'plamda tortmaymiz.
// Rasm bor-yo'qligi — has_plan/has_photo bayroqlaridan (LENGTH() har so'rovda butun rasmni o'qirdi).
// Rasmning o'zi /api/apt-image orqali beriladi.
const APT_LIST_COLS =
  'id, project_id, floor, number, rooms, area, price_cash, price_installment, status, orientation, note, has_plan, has_photo';

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
