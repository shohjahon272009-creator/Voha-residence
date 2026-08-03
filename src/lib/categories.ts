import { Locale } from './dictionaries';

// Joylashuv / infratuzilma kategoriyalari — admin loyihaга belgilaydi,
// saytда chiroyli rasmli bo'lim va filtr sifatida ko'rinadi.
export interface CategoryDef {
  key: string;
  emoji: string;
  image: string;    // fon rasmi
  gradient: string; // rasm yuklanmasa — zaxira gradient (tailwind)
  label: Record<Locale, string>;
}

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const CATEGORIES: CategoryDef[] = [
  { key: 'school',       emoji: '🏫', image: U('1580582932707-520aed937b7b'), gradient: 'from-blue-500 to-indigo-600',    label: { uz: 'Maktab yonida',       ru: 'Рядом школа',         en: 'Near school' } },
  { key: 'kindergarten', emoji: '🧸', image: U('1503454537195-1dcabb73ffb9'), gradient: 'from-pink-400 to-rose-500',     label: { uz: 'Bog‘cha yonida',      ru: 'Рядом детсад',        en: 'Near kindergarten' } },
  { key: 'water',        emoji: '💧', image: U('1470071459604-3b5ec3a7fe05'), gradient: 'from-cyan-500 to-blue-600',     label: { uz: 'Suv bo‘yida',         ru: 'У воды',              en: 'Near water' } },
  { key: 'park',         emoji: '🌳', image: U('1441974231531-c6227db76b6e'), gradient: 'from-green-500 to-emerald-600', label: { uz: 'Park / yashil hudud', ru: 'Парк / зелёная зона', en: 'Park / greenery' } },
  { key: 'hospital',     emoji: '🏥', image: U('1519494026892-80bbd2d6fd0d'), gradient: 'from-red-400 to-rose-600',      label: { uz: 'Shifoxona yaqin',     ru: 'Рядом больница',      en: 'Near hospital' } },
  { key: 'shopping',     emoji: '🛒', image: U('1441986300917-64674bd600d8'), gradient: 'from-amber-500 to-orange-600',  label: { uz: 'Savdo markazi',       ru: 'Торговый центр',      en: 'Shopping center' } },
  { key: 'transport',    emoji: '🚌', image: U('1570125909232-eb263c188f7e'), gradient: 'from-slate-500 to-gray-700',    label: { uz: 'Transport yaqin',     ru: 'Рядом транспорт',     en: 'Near transport' } },
  { key: 'mosque',       emoji: '🕌', image: U('1519817650390-64a93db51149'), gradient: 'from-teal-500 to-emerald-700',  label: { uz: 'Masjid yaqin',        ru: 'Рядом мечеть',        en: 'Near mosque' } },
];

export const categoryLabel = (key: string, lang: Locale): string => {
  const c = CATEGORIES.find((x) => x.key === key);
  return c ? c.label[lang] || c.label.uz : key;
};

export const categoryEmoji = (key: string): string =>
  CATEGORIES.find((x) => x.key === key)?.emoji || '📍';
