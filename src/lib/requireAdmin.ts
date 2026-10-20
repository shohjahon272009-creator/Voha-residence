import { cookies } from 'next/headers';
import db from './db';
import { SESSION_COOKIE, verifySessionPayload } from './session';

/*
  Admin sessiyasini tekshiradi. proxy.ts faqat /admin SAHIFALARINI to'sadi —
  server action'lar va /api yo'llari esa istalgan manzildan chaqirilishi mumkin.
  Shuning uchun har bir admin amali va admin API shu funksiyani chaqirishi SHART.
*/
export async function getAdminId(): Promise<number | null> {
  const cookieStore = await cookies();
  const s = await verifySessionPayload(cookieStore.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  // Foydalanuvchi hali mavjudmi va token eskirmaganmi (parol almashtirilgan / chiqilgan bo'lsa versiya oshgan)
  const u = await db.prepare('SELECT session_version FROM users WHERE id = ?').get(s.userId) as
    | { session_version: number | null }
    | undefined;
  if (!u || Number(u.session_version || 0) !== s.version) return null;
  return s.userId;
}

export async function requireAdmin(): Promise<number> {
  const id = await getAdminId();
  if (!id) throw new Error('Ruxsat yo\'q: admin sifatida kiring.');
  return id;
}
