'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from './db';
import { hashPassword, verifyPassword, isHashed } from './password';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, verifySessionToken } from './session';

interface UserRow {
  id: number;
  email: string;
  password: string;
}

export type LoginState = { error: string } | null;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email va parolni kiriting' };
  }

  const user = await db.prepare('SELECT id, email, password FROM users WHERE email = ?').get(email) as
    | UserRow
    | undefined;

  if (!user || !verifyPassword(password, user.password)) {
    return { error: "Email yoki parol noto'g'ri!" };
  }

  // Transparently upgrade a legacy plaintext password to a salted hash.
  if (!isHashed(user.password)) {
    await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(password), user.id);
  }

  const token = await createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  redirect('/admin/dashboard');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export type ChangePasswordState = { error?: string; success?: boolean } | null;

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const userId = await getSessionUserId();
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

  await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(next), userId);
  return { success: true };
}
