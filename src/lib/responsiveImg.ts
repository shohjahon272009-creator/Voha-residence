import variants from './uploadVariants.json';

/*
  /uploads rasmlari uchun srcSet: telefon 640px, kartochka/planshet 1280px, katta ekran asl rasm.
  Nusxalar scripts/make-image-variants.mjs bilan oldindan yaratilgan; ro'yxatda yo'q rasm
  (masalan, admin keyin yuklagan) o'zgarishsiz qaytadi.
*/
// nom -> asl rasm kengligi (srcSet'da haqiqiy o'lcham — brauzer keraksiz katta faylni tanlamasin)
const WIDTH = variants as Record<string, number>;
const has = (name: string) => Object.prototype.hasOwnProperty.call(WIDTH, name);

export function responsive(src: string | null | undefined, sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw') {
  const s = src || '';
  const m = s.match(/^\/uploads\/([^/?#]+)$/);
  if (!m || !has(m[1])) return { src: s };
  const base = m[1].replace(/\.[^.]+$/, '');
  const w = WIDTH[m[1]] || 1280;
  const set = [`/uploads/_w/640/${base}.webp ${Math.min(640, w)}w`];
  if (w > 640) set.push(`/uploads/_w/1280/${base}.webp ${Math.min(1280, w)}w`);
  if (w > 1280) set.push(`${s} ${w}w`); // asl rasm — faqat haqiqatan kattaroq bo'lsa
  return { src: `/uploads/_w/1280/${base}.webp`, srcSet: set.join(', '), sizes };
}
