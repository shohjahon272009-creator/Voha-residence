'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import db from './db';
import { requireAdmin } from './requireAdmin';
import { salehouseConfigured } from './salehouse';
import { applyReport } from './salehouseSync';
import { readJob, startReportJob } from './salehouseJob';

// Admin "Qo'llash" — Sale House'dagi holatlarni saytga yozadi (Sale House'ga hech narsa yozilmaydi)
export async function applySaleHouseSync() {
  await requireAdmin();
  if (!salehouseConfigured()) redirect('/admin/salehouse');
  // Admin ko'rgan hisobot qo'llanadi (har o'zgarish "WHERE status = eski" bilan — oradagi o'zgarishni bosmaydi)
  const { report } = await readJob();
  if (!report || Date.now() - new Date(report.at).getTime() > 30 * 60_000) redirect('/admin/salehouse?stale=1');
  const n = await applyReport(report);
  revalidatePath('/admin/apartments');
  revalidatePath('/admin/projects');
  revalidatePath('/', 'layout');
  redirect(`/admin/salehouse?applied=${n}`);
}

// Avtomatik yangilash (har 10 daqiqada server cron'i) — yoqish/o'chirish
export async function setSaleHouseAuto(formData: FormData) {
  await requireAdmin();
  const on = formData.get('on') === '1' ? '1' : '0';
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_salehouse_auto', on, on);
  redirect('/admin/salehouse');
}

// "Solishtirish" — hisobotni fonda boshlaydi, sahifa darhol qaytadi
export async function startSaleHouseReport() {
  await requireAdmin();
  if (!salehouseConfigured()) redirect('/admin/salehouse');
  await startReportJob();
  redirect('/admin/salehouse');
}
