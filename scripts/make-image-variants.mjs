// public/uploads rasmlarining kichik nusxalari (640 va 1280 px, webp) — telefon va kartochkalar
// to'liq 2560px rasmni yuklamasin. Natija: public/uploads/_w/{640,1280}/<nom>.webp va
// src/lib/uploadVariants.json (qaysi rasmlarning nusxasi borligi). Yangi rasm qo'shilsa qayta ishga tushiring:
//   node scripts/make-image-variants.mjs
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public', 'uploads');
const WIDTHS = [640, 1280];
const names = [];

for (const f of fs.readdirSync(dir)) {
  if (!/\.(jpe?g|png|webp)$/i.test(f) || /qr/i.test(f)) continue;
  const base = f.replace(/\.[^.]+$/, '');
  const src = path.join(dir, f);
  const meta = await sharp(src).metadata();
  for (const w of WIDTHS) {
    const outDir = path.join(dir, '_w', String(w));
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, base + '.webp');
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    await sharp(src).resize({ width: Math.min(w, meta.width || w), withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  }
  names.push(f);
}
names.sort();
fs.writeFileSync(path.join(root, 'src', 'lib', 'uploadVariants.json'), JSON.stringify(names, null, 0) + '\n');
console.log(`${names.length} ta rasm uchun nusxalar tayyor`);
