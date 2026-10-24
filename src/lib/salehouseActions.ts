'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import db from './db';
import { requireAdmin } from './requireAdmin';
import { salehouseConfigured } from './salehouse';
import { buildReport, applyReport } from './salehouseSync';

// Admin "Qo'llash" — Sale House'dagi holatlarni saytga yozadi (Sale House'ga hech narsa yozilmaydi)
export async function applySaleHouseSync() {
  await requireAdmin();
  if (!salehouseConfigured()) redirect('/admin/salehouse');
  const n = await applyReport(await buildReport());
  revalidatePath('/admin/apartments');
  redirect(`/admin/salehouse?applied=${n}`);
}

// Avtomatik yangilash (har 10 daqiqada server cron'i) — yoqish/o'chirish
export async function setSaleHouseAuto(formData: FormData) {
  await requireAdmin();
  const on = formData.get('on') === '1' ? '1' : '0';
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_salehouse_auto', on, on);
  redirect('/admin/salehouse');
}
