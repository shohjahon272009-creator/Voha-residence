import { headers } from 'next/headers';

/*
  Mijoz IP manzili (so'rovlar limiti uchun). Avval x-real-ip: uni proksi o'zi qo'yadi
  (Vercel; nginx — `proxy_set_header X-Real-IP $remote_addr`) va mijoz soxtalashtira olmaydi.
  X-Forwarded-For'ning BIRINCHI qiymatini esa mijoz o'zi yuborishi mumkin (nginx
  $proxy_add_x_forwarded_for unga qo'shadi) — shuning uchun undan faqat oxirgi qiymatni olamiz
  (bizga eng yaqin proksi yozgan).
*/
export async function clientIp(): Promise<string> {
  const h = await headers();
  const real = h.get('x-real-ip')?.trim();
  if (real) return real;
  const xff = (h.get('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean);
  return xff.length ? xff[xff.length - 1] : '';
}
