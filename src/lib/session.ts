// Edge-safe session token helpers (HMAC-signed cookie).
// Uses Web Crypto only so it can run in both the Node and Edge (middleware) runtimes.
// Do NOT import `node:*` modules or the database here — it would break the Edge runtime.

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Fallback keeps dev working, but production MUST set AUTH_SECRET.
    return 'dev-insecure-secret-please-set-AUTH_SECRET';
  }
  return secret;
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
  const key = await importKey(getSecret());
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
  const key = await importKey(getSecret());
  const expected = toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));

  if (!timingSafeEqual(signature, expected)) return null;
  if (Date.now() > Number(expires)) return null;

  const id = Number(userId);
  return Number.isFinite(id) ? id : null;
}
