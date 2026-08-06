import path from 'path';
import fs from 'fs/promises';

function mimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  return 'image/jpeg';
}

/*
  Rasm yuklashni DOIMIY saqlash — hech qachon yo'qolmasligi kafolatlangan.

  Tartib:
  1) Vercel Blob (BLOB_READ_WRITE_TOKEN bo'lsa) — bulutli, tez, doimiy.
  2) Mahalliy dev (Vercel'da emas) — public/uploads.
  3) Zaxira (serverless, Blob biror sababdan ishlamasa) — base64 data URL bazada.
     Bu har doim ishlaydi, shuning uchun rasm HECH QACHON yo'qolmaydi.
*/
// Rasmni siqib kichraytiradi (400 KB+ -> ~60 KB). Shunda tez saqlanadi va baza shishmaydi.
// sharp bo'lmasa yoki xato bo'lsa — asl rasm ishlatiladi (hech narsa buzilmaydi).
async function compress(buffer: Buffer, type: string): Promise<{ buffer: Buffer; type: string; ext: string } | null> {
  if (type === 'image/svg+xml' || type === 'image/gif') return null; // bularni siqmaymiz
  try {
    const sharp = (await import('sharp')).default;
    const out = await sharp(buffer)
      .rotate() // telefon rasmidagi EXIF burilishini to'g'rilaydi
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    if (out.length < buffer.length) return { buffer: out, type: 'image/webp', ext: 'webp' };
  } catch { /* sharp yo'q yoki rasm emas — asl holicha qoladi */ }
  return null;
}

export async function saveUpload(
  buffer: Buffer,
  fileName: string,
  contentType?: string,
): Promise<string> {
  let type = contentType || mimeFromName(fileName);

  // 0) Siqish — imkoni bo'lsa kichraytiramiz
  const small = await compress(buffer, type);
  if (small) {
    buffer = small.buffer;
    type = small.type;
    fileName = fileName.replace(/\.[^.]+$/, '') + '.' + small.ext;
  }

  // 1) Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${fileName}`, buffer, {
        access: 'public',
        contentType: type,
        addRandomSuffix: true,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return blob.url;
    } catch (e) {
      // Xatoni bazaga yozamiz (Vercel loglarini ko'ra olmaymiz) va zaxiraga o'tamiz
      try {
        const db = (await import('./db')).default;
        const msg = `${new Date().toISOString()}: ${(e as Error)?.message || String(e)}`;
        await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run('_upload_error', msg, msg);
      } catch { /* ignore */ }
    }
  }

  // 2) Mahalliy dev — fayl tizimi (Vercel'da ishlamaydi, shuning uchun faqat lokal)
  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
      return `/uploads/${fileName}`;
    } catch { /* zaxiraga o'tamiz */ }
  }

  // 3) Zaxira — base64 data URL (bazada doimiy saqlanadi, kafolatli ishlaydi)
  return `data:${type};base64,${buffer.toString('base64')}`;
}
