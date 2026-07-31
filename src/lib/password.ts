// Password hashing using Node's built-in scrypt (no external dependency).
// Stored format: `scrypt$<saltHex>$<hashHex>`.
import crypto from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  // Legacy support: rows seeded with a plaintext password are accepted once,
  // then upgraded to a hash on the next successful login (see auth.ts).
  if (!stored.startsWith('scrypt$')) {
    return stored === password;
  }

  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const testBuffer = crypto.scryptSync(password, salt, KEY_LENGTH);
  return hashBuffer.length === testBuffer.length && crypto.timingSafeEqual(hashBuffer, testBuffer);
}

export function isHashed(stored: string): boolean {
  return stored.startsWith('scrypt$');
}
