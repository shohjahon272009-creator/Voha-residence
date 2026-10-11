import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './session';

/*
  Admin sessiyasini tekshiradi. proxy.ts faqat /admin SAHIFALARINI to'sadi —
  server action'lar va /api yo'llari esa istalgan manzildan chaqirilishi mumkin.
  Shuning uchun har bir admin amali va admin API shu funksiyani chaqirishi SHART.
*/
export async function getAdminId(): Promise<number | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<number> {
  const id = await getAdminId();
  if (!id) throw new Error('Ruxsat yo\'q: admin sifatida kiring.');
  return id;
}
