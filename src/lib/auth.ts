'use server';

import { cookies } from 'next/headers';
import { clientIp } from './clientIp';
import { redirect } from 'next/navigation';
import db from './db';
import { hashPassword, verifyPassword, isHashed } from './password';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, verifySessionPayload } from './session';
import { getAdminId } from './requireAdmin';

interface UserRow {
  id: number;
  email: string;
  password: string;
  session_version: number | null;
}

async function setSessionCookie(userId: number, version: number) {
  const token = await createSessionToken(userId, version);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export type LoginState = { error: string } | null;

const LOGIN_MAX_FAILS = 5;          // bitta IP + email: 15 daqiqada
const LOGIN_MAX_FAILS_EMAIL = 50;   // email bo'yicha jami (faqat xato qilgan IP'larga — pastga qarang)
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type FailCounter = { key: string; count: number; since: number; open: boolean; exists: boolean };

async function readCounter(key: string): Promise<FailCounter> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  const [count, since] = (row?.value || '0|0').split('|').map(Number);
  return { key, count, since, open: Date.now() - since < LOGIN_WINDOW_MS, exists: Boolean(row) };
}

async function bumpCounter(c: FailCounter) {
  const next = c.open ? `${c.count + 1}|${c.since}` : `1|${Date.now()}`;
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(c.key, next, next);
  // Muddati o'tgan hisoblagichlarni tozalaymiz (IP bo'yicha kalitlar settings jadvalini to'ldirib yubormasin)
  await db.prepare(
    "DELETE FROM settings WHERE substr(key, 1, 12) = '_login_fail:' AND CAST(substr(value, instr(value, '|') + 1) AS INTEGER) < ?"
  ).run(Date.now() - LOGIN_WINDOW_MS);
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email va parolni kiriting' };
  }

  // Parolni taxmin qilishdan himoya (bazada — serverless xotirasi saqlanmaydi):
  //  • IP + email: 15 daqiqada 5 ta xato. Faqat email bo'yicha bo'lsa, begona odam ataylab 5 marta
  //    xato kiritib haqiqiy adminni cheksiz to'sib qo'yishi mumkin edi.
  //  • email bo'yicha jami 50 ta — ko'p IP'dan parol terishni sekinlatadi.
  const ip = (await clientIp()) || 'unknown';
  const ipFail = await readCounter(`_login_fail:${ip}:${email}`);
  const emailFail = await readCounter(`_login_fail:${email}`);
  // Email bo'yicha jami chegara faqat ALLAQACHON xato qilgan IP'larga qo'llanadi: hujumchi 50 ta xato
  // yuborib haqiqiy adminni (toza IP'dan) to'sib qo'ya olmaydi, ko'p IP'dan parol terish esa
  // har IP'ga 1 urinishgacha sekinlashadi.
  const ipHasFails = ipFail.open && ipFail.count > 0;
  if ((ipFail.open && ipFail.count >= LOGIN_MAX_FAILS) || (ipHasFails && emailFail.open && emailFail.count >= LOGIN_MAX_FAILS_EMAIL)) {
    return { error: "Juda ko'p noto'g'ri urinish. 15 daqiqadan keyin qayta urinib ko'ring." };
  }

  const user = await db.prepare('SELECT id, email, password, session_version FROM users WHERE email = ?').get(email) as
    | UserRow
    | undefined;

  if (!user || !verifyPassword(password, user.password)) {
    await bumpCounter(ipFail);
    await bumpCounter(emailFail);
    return { error: "Email yoki parol noto'g'ri!" };
  }
  if (ipFail.exists) await db.prepare('DELETE FROM settings WHERE key = ?').run(ipFail.key);

  // Transparently upgrade a legacy plaintext password to a salted hash.
  if (!isHashed(user.password)) {
    await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(password), user.id);
  }

  await setSessionCookie(user.id, Number(user.session_version || 0));

  redirect('/admin/dashboard');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  // Chiqish — bu foydalanuvchining BARCHA qurilmalardagi sessiyalari bekor bo'ladi
  // (o'g'irlangan cookie ham ishlamay qoladi)
  const s = await verifySessionPayload(cookieStore.get(SESSION_COOKIE)?.value);
  if (s) await db.prepare('UPDATE users SET session_version = COALESCE(session_version, 0) + 1 WHERE id = ? AND COALESCE(session_version, 0) = ?').run(s.userId, s.version);
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}

export type ChangePasswordState = { error?: string; success?: boolean } | null;

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const userId = await getAdminId();
  if (!userId) return { error: 'Sessiya tugagan. Iltimos, qaytadan kiring.' };

  const current = String(formData.get('current_password') || '');
  const next = String(formData.get('new_password') || '');
  const confirm = String(formData.get('confirm_password') || '');

  if (!current || !next || !confirm) return { error: "Barcha maydonlarni to'ldiring." };
  if (next.length < 6) return { error: "Yangi parol kamida 6 ta belgidan iborat bo'lsin." };
  if (next !== confirm) return { error: 'Yangi parollar bir-biriga mos kelmadi.' };

  const user = await db.prepare('SELECT id, password FROM users WHERE id = ?').get(userId) as
    | { id: number; password: string }
    | undefined;
  if (!user || !verifyPassword(current, user.password)) {
    return { error: "Joriy parol noto'g'ri." };
  }

  // Parol almashdi — boshqa barcha sessiyalar bekor; joriy qurilmaga yangi cookie beramiz
  await db.prepare('UPDATE users SET password = ?, session_version = COALESCE(session_version, 0) + 1 WHERE id = ?').run(hashPassword(next), userId);
  const v = await db.prepare('SELECT session_version FROM users WHERE id = ?').get(userId) as { session_version: number } | undefined;
  await setSessionCookie(userId, Number(v?.session_version || 0));
  return { success: true };
}
