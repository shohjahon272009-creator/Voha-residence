import { cache } from 'react';
import db from './db';

/*
  Ommaviy sahifalar uchun sozlamalar. Maxfiy kalitlar (Telegram bot tokeni, chat ID,
  "_" bilan boshlanadigan ichki yozuvlar — login hisoblagichlari, xato loglari) bu yerdan
  HECH QACHON qaytmaydi: sozlamalar ko'pincha client komponentlarga prop bo'lib o'tadi va
  sahifa kodiga (RSC payload) yoziladi — ilgari bot_token shu yo'l bilan hammaga ochiq turgan.
  cache(): bitta so'rov ichida (layout + metadata + sahifa) baza faqat bir marta so'raladi.
*/
const PRIVATE_KEYS = new Set(['bot_token', 'admin_chat_id']);
export const isPrivateSetting = (key: string) => key.startsWith('_') || PRIVATE_KEYS.has(key);

export const getPublicSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  const out: Record<string, string> = {};
  for (const r of rows) if (!isPrivateSetting(r.key)) out[r.key] = r.value;
  return out;
});
