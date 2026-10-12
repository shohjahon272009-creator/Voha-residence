// Edge-safe session token helpers (HMAC-signed cookie).
// Uses Web Crypto only so it can run in both the Node and Edge (middleware) runtimes.
// Do NOT import `node:*` modules or the database here — it would break the Edge runtime.

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

const encoder = new TextEncoder();

// Production'da AUTH_SECRET bo'lmasa — null: sessiya yaratilmaydi va hech qaysi token qabul qilinmaydi.
// (Avval ochiq repodagi zaxira kalit ishlatilardi — istalgan odam admin cookie'sini soxtalashtira olardi.)
function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.error('AUTH_SECRET o\'rnatilmagan — admin kirishi o\'chirildi. Vercel env\'ga AUTH_SECRET qo\'shing.');
    return null;
  }
  return 'dev-insecure-secret-please-set-AUTH_SECRET'; // faqat lokal ishlab chiqish
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function createSessionToken(userId: number): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}.${expires}`;
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET o'rnatilmagan");
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

/** Returns the userId if the token is valid and unexpired, otherwise null. */
export async function verifySessionToken(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  const payload = `${userId}.${expires}`;
  const secret = getSecret();
  if (!secret) return null;
  const key = await importKey(secret);
  const expected = toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));

  if (!timingSafeEqual(signature, expected)) return null;
  if (Date.now() > Number(expires)) return null;

  const id = Number(userId);
  return Number.isFinite(id) ? id : null;
}
