'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from './requireAdmin';

/*
  Admin: 3D tur pinlari va model manzili. Har amal requireAdmin bilan himoyalangan
  (server action'lar istalgan manzildan chaqirilishi mumkin).
*/

type Result = { ok: true } | { ok: false; error: string };

const revalidateScene = () => {
  revalidatePath('/admin/3d');
  for (const l of ['uz', 'ru', 'en']) revalidatePath(`/${l}/3d`);
};

const text = (v: FormDataEntryValue | null, max = 120) => String(v ?? '').trim().slice(0, max);
// Bo'sh maydon — 0; vergul bilan yozilgan kasr ham qabul qilinadi (12,5)
const real = (v: FormDataEntryValue | null) => {
  const n = Number.parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export async function saveScenePin(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get('id'), 12), 10);
  const projectId = Number.parseInt(text(formData.get('project_id'), 12), 10);
  if (!Number.isInteger(projectId) || projectId <= 0) return { ok: false, error: 'Loyihani tanlang.' };
  const project = await db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!project) return { ok: false, error: 'Loyiha topilmadi.' };

  const values = [
    projectId,
    text(formData.get('mesh_name'), 80) || null,
    real(formData.get('x')), real(formData.get('y')), real(formData.get('z')),
    real(formData.get('cam_x')), real(formData.get('cam_y')), real(formData.get('cam_z')),
    text(formData.get('label_uz')) || null, text(formData.get('label_ru')) || null, text(formData.get('label_en')) || null,
    Number.parseInt(text(formData.get('sort_order'), 6), 10) || 0,
  ];

  if (Number.isInteger(id) && id > 0) {
    await db.prepare(`UPDATE scene_pins SET project_id = ?, mesh_name = ?, x = ?, y = ?, z = ?,
      cam_x = ?, cam_y = ?, cam_z = ?, label_uz = ?, label_ru = ?, label_en = ?, sort_order = ? WHERE id = ?`).run(...values, id);
  } else {
    await db.prepare(`INSERT INTO scene_pins (project_id, mesh_name, x, y, z, cam_x, cam_y, cam_z, label_uz, label_ru, label_en, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(...values);
  }
  revalidateScene();
  return { ok: true };
}

export async function deleteScenePin(id: number): Promise<Result> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Notöğri pin." };
  await db.prepare('DELETE FROM scene_pins WHERE id = ?').run(id);
  revalidateScene();
  return { ok: true };
}

// Model manzili: bo'sh — placeholder. Faqat .glb/.gltf, https yoki sayt ichidagi yo'l (/3d/...).
export async function saveSceneModel(formData: FormData): Promise<Result> {
  await requireAdmin();
  const url = text(formData.get('scene_model_url'), 500);
  if (url) {
    const okScheme = /^https:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//'));
    if (!okScheme) return { ok: false, error: "Manzil https:// yoki / bilan boşlanişi kerak (masalan /3d/mavze.glb)." };
    if (!/\.(glb|gltf)(\?.*)?$/i.test(url)) return { ok: false, error: 'Fayl .glb yoki .gltf bölişi kerak.' };
  }
  const set = (key: string, value: string) =>
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
  await set('scene_model_url', url);
  // Brauzer eski modelni keshdan olmasligi uchun versiya har saqlashda yangilanadi
  await set('scene_version', String(Date.now()));
  revalidateScene();
  return { ok: true };
}
