'use server';

import { headers } from 'next/headers';
import db from '@/lib/db';

/*
  Saytdagi ommaviy formalar (murojaat, narxni bilish).
  Spamga qarshi: telefon tekshiruvi, matn uzunligi cheklovi va bazaga
  asoslangan limit (serverless'da xotira saqlanmaydi, shuning uchun baza).
  Xonadon holatini bu yerda O'ZGARTIRMAYMIZ — buni faqat admin qiladi.
*/

const LIMIT_PER_IP = 5;      // bir IP'dan soatiga
const LIMIT_PER_PHONE = 3;   // bir raqamdan soatiga
const LIMIT_GLOBAL = 60;     // jami soatiga (hujum bo'lsa ham bazani to'ldirmaslik uchun)

const clip = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);

// Raqamlarni ajratib oladi: 9 xonali mahalliy raqamga +998 qo'shadi, 10–15 xonali xalqaro raqamni qabul qiladi.
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '').trim();
}

// Limitdan oshgan bo'lsa xato matnini qaytaradi
async function checkRateLimit(ip: string, phone: string): Promise<string | null> {
  const since = "datetime('now', '-1 hour')";
  const count = async (where: string, args: unknown[]) =>
    Number(((await db.prepare(`SELECT count(*) AS c FROM bookings WHERE created_at > ${since}${where}`).get(...args)) as { c: number })?.c) || 0;

  const tooMany = "So'rovlar soni ko'payib ketdi. Iltimos, birozdan keyin urinib ko'ring yoki bizga qo'ng'iroq qiling.";
  if (ip && (await count(' AND ip = ?', [ip])) >= LIMIT_PER_IP) return tooMany;
  if ((await count(' AND client_phone = ?', [phone])) >= LIMIT_PER_PHONE) return tooMany;
  if ((await count('', [])) >= LIMIT_GLOBAL) return tooMany;
  return null;
}

// Telegram Markdown belgilarini qochiradi — aks holda `_` yoki `*` bor ism xabarni buzadi
const md = (s: string) => s.replace(/([_*`\[])/g, '\\$1');

async function notifyTelegram(text: string) {
  const tokenRow = await db.prepare('SELECT value FROM settings WHERE key = ?').get('bot_token') as { value: string } | undefined;
  const chatIdRow = await db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_chat_id') as { value: string } | undefined;
  if (!tokenRow?.value || !chatIdRow?.value) return;

  await fetch(`https://api.telegram.org/bot${tokenRow.value}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatIdRow.value, text, parse_mode: 'Markdown' }),
  }).catch(e => console.error("Telegram error:", e));
}

export async function submitContact(formData: FormData) {
  const name = clip(formData.get('name'), 100);
  const message = clip(formData.get('message'), 1000);
  const phone = normalizePhone(clip(formData.get('phone'), 40));

  if (!name || !phone) return { success: false, error: "Ism va to'g'ri telefon raqam kiritilishi shart" };

  try {
    const ip = await clientIp();
    const limited = await checkRateLimit(ip, phone);
    if (limited) return { success: false, error: limited };

    // Umumiy murojaat sifatida bookings jadvaliga yoziladi (apartment_id = NULL)
    await db.prepare(`
      INSERT INTO bookings (client_name, client_phone, note, status, ip)
      VALUES (?, ?, ?, 'Yangi', ?)
    `).run(name, phone, message, ip);

    await notifyTelegram(`🔔 *Yangi xabar (Saytdan)*\n\n👤 *Ism:* ${md(name)}\n📞 *Telefon:* ${phone}\n💬 *Xabar:* ${md(message) || "Yo'q"}`);

    return { success: true };
  } catch (error) {
    console.error("Submit error:", error);
    return { success: false, error: "Xatolik yuz berdi" };
  }
}

export async function submitPriceRequest(formData: FormData) {
  const apartmentId = parseInt(clip(formData.get('apartmentId'), 12), 10);
  const name = clip(formData.get('name'), 100) || 'Mijoz';
  const message = clip(formData.get('message'), 1000);
  const phone = normalizePhone(clip(formData.get('phone'), 40));

  if (!apartmentId || !phone) return { success: false, error: "To'g'ri telefon raqamini kiritish shart" };

  try {
    const aptDetails = await db.prepare(`
      SELECT a.number, p.name_uz as project_name
      FROM apartments a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `).get(apartmentId) as { number: string, project_name: string } | undefined;
    if (!aptDetails) return { success: false, error: "Xonadon topilmadi" };

    const ip = await clientIp();
    const limited = await checkRateLimit(ip, phone);
    if (limited) return { success: false, error: limited };

    await db.prepare(`
      INSERT INTO bookings (apartment_id, client_name, client_phone, payment_type, note, status, ip)
      VALUES (?, ?, ?, 'Narxini bilish', ?, 'Yangi', ?)
    `).run(apartmentId, name, phone, message || null, ip);

    const aptInfo = `${aptDetails.project_name}, №${aptDetails.number} xonadon`;
    await notifyTelegram(`💰 *Yangi so'rov (Narxini bilish)*\n\n👤 *Ism:* ${md(name)}\n📞 *Telefon:* ${phone}\n🏢 *Xonadon:* ${md(aptInfo)}`);

    return { success: true };
  } catch (error) {
    console.error("Price request error:", error);
    return { success: false, error: "Xatolik yuz berdi" };
  }
}
