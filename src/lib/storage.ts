import path from 'path';
import fs from 'fs/promises';

/*
  Rasm/fayl yuklashni DOIMIY saqlash.

  • BLOB_READ_WRITE_TOKEN o'rnatilgan bo'lsa (Vercel Blob) → bulutli, doimiy saqlanadi.
    Vercel serverlessда public/uploads vaqtinchalik bo'lgani uchun (so'rovdan keyin
    o'chib ketadi), yuklangan rasmlar aynan shu sababdan yo'qolardi. Blob buni hal qiladi.
  • Aks holda (mahalliy dev) → public/uploads ga yoziladi.
*/
export async function saveUpload(
  buffer: Buffer,
  fileName: string,
  contentType?: string,
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${fileName}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}
