import { cache } from 'react';
import db from './db';
import { getPublicProjects, getApartments } from './actions';
import { getPublicSettings } from './settings';

/*
  3D tur ma'lumotlari: model manzili + pinlar + har pin uchun loyiha va xonadonlar.
  Hammasi bitta so'rovda (/api/3d/scene) keladi — pin bosilganda qo'shimcha yuklash yo'q.
  NARXLAR YUBORILMAYDI: rahbar qarori bo'yicha saytda narx ochiq ko'rsatilmaydi
  ("Narxini bilish" / menejer aytadi), loyiha sahifasi ham shunday qiladi.
*/

export const PLACEHOLDER_MODEL_URL = '/3d/placeholder.glb';

export interface ScenePin {
  id: number;
  project_id: number;
  mesh_name: string | null;
  x: number; y: number; z: number;
  cam_x: number; cam_y: number; cam_z: number;
  label_uz: string | null; label_ru: string | null; label_en: string | null;
  sort_order: number;
}

export interface SceneApartment {
  id: number;
  floor: number;
  number: string;
  rooms: number;
  area: number;
  status: string;
  plan_image: string; // /api/apt-image manzili yoki ''
}

export interface SceneBuilding extends ScenePin {
  project: {
    id: number;
    name_uz: string; name_ru: string; name_en: string;
    status: string;
    total_floors: number | null;
    main_image: string; // /api/media yoki /uploads manzili, bo'lsa
    district: string; city: string;
    is_sold_out: boolean;
    days_left: number;
  };
  counts: { total: number; available: number };
  apartments: SceneApartment[];
}

export interface SceneData {
  modelUrl: string;
  version: string;
  buildings: SceneBuilding[];
}

// Admin kiritgan model manzili: faqat https/http yoki sayt ichidagi yo'l (javascript: va h.k. emas)
export function safeModelUrl(v: string | undefined | null): string {
  const u = (v || '').trim();
  if (/^https?:\/\//i.test(u) || (u.startsWith('/') && !u.startsWith('//'))) return u;
  return PLACEHOLDER_MODEL_URL;
}

const num = (v: unknown) => (v == null ? 0 : Number(v));

export async function getScenePins(): Promise<ScenePin[]> {
  const rows = (await db.prepare('SELECT * FROM scene_pins ORDER BY sort_order, id').all()) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    project_id: Number(r.project_id),
    mesh_name: (r.mesh_name as string) || null,
    x: num(r.x), y: num(r.y), z: num(r.z),
    cam_x: num(r.cam_x), cam_y: num(r.cam_y), cam_z: num(r.cam_z),
    label_uz: (r.label_uz as string) || null,
    label_ru: (r.label_ru as string) || null,
    label_en: (r.label_en as string) || null,
    sort_order: num(r.sort_order),
  }));
}

export async function hasScenePin(projectId: number): Promise<boolean> {
  const r = await db.prepare('SELECT 1 AS ok FROM scene_pins WHERE project_id = ? LIMIT 1').get(projectId);
  return Boolean(r);
}

export const getSceneData = cache(async (): Promise<SceneData> => {
  const [pins, projects, apartments, settings] = await Promise.all([
    getScenePins(), getPublicProjects(), getApartments(), getPublicSettings(),
  ]);
  const byProject = new Map(projects.map((p) => [p.id, p]));
  const buildings: SceneBuilding[] = [];
  for (const pin of pins) {
    const p = byProject.get(pin.project_id);
    if (!p) continue; // loyiha o'chirilgan — pin ko'rsatilmaydi
    const list = apartments
      .filter((a) => a.project_id === p.id)
      .sort((a, b) => a.floor - b.floor || String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
      .map((a) => ({
        id: a.id, floor: a.floor, number: String(a.number ?? ''), rooms: a.rooms, area: a.area,
        status: a.status, plan_image: a.plan_image || '',
      }));
    buildings.push({
      ...pin,
      project: {
        id: p.id, name_uz: p.name_uz, name_ru: p.name_ru, name_en: p.name_en, status: p.status,
        total_floors: p.total_floors ?? null,
        main_image: p.main_image && p.main_image !== 'data:' ? p.main_image : '',
        district: p.district || '', city: p.city || '',
        is_sold_out: Boolean(p.is_sold_out), days_left: Number(p.days_left) || 0,
      },
      counts: { total: list.length, available: list.filter((a) => a.status === "Bo'sh").length },
      apartments: list,
    });
  }
  return {
    modelUrl: safeModelUrl(settings.scene_model_url),
    version: settings.scene_version || '1',
    buildings,
  };
});
