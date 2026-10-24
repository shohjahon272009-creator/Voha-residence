import variants from './uploadVariants.json';

/*
  /uploads rasmlari uchun srcSet: telefon 640px, kartochka/planshet 1280px, katta ekran asl (2560px).
  Nusxalar scripts/make-image-variants.mjs bilan oldindan yaratilgan; ro'yxatda yo'q rasm
  (masalan, admin keyin yuklagan) o'zgarishsiz qaytadi.
*/
const HAS = new Set<string>(variants as string[]);

export function responsive(src: string | null | undefined, sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw') {
  const s = src || '';
  const m = s.match(/^\/uploads\/([^/?#]+)$/);
  if (!m || !HAS.has(m[1])) return { src: s };
  const base = m[1].replace(/\.[^.]+$/, '');
  return {
    src: `/uploads/_w/1280/${base}.webp`,
    srcSet: `/uploads/_w/640/${base}.webp 640w, /uploads/_w/1280/${base}.webp 1280w, ${s} 2560w`,
    sizes,
  };
}

// Fon rasmlari (CSS background) uchun: telefon/planshetda 1280px nusxa, katta ekranda asl
export function bgFor(src: string | null | undefined, wide: boolean): string {
  const s = src || '';
  const m = s.match(/^\/uploads\/([^/?#]+)$/);
  if (wide || !m || !HAS.has(m[1])) return s;
  return `/uploads/_w/1280/${m[1].replace(/\.[^.]+$/, '')}.webp`;
}
