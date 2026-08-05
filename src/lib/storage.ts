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
export async function saveUpload(
  buffer: Buffer,
  fileName: string,
  contentType?: string,
): Promise<string> {
  const type = contentType || mimeFromName(fileName);

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
