import { Locale } from './dictionaries';

// Joylashuv / infratuzilma kategoriyalari — admin loyihaга belgilaydi,
// saytда chiroyli bo'lim va filtr sifatida ko'rinadi.
export interface CategoryDef {
  key: string;
  emoji: string;
  label: Record<Locale, string>;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'school',       emoji: '🏫', label: { uz: 'Maktab yonida',      ru: 'Рядом школа',        en: 'Near school' } },
  { key: 'kindergarten', emoji: '🧸', label: { uz: 'Bog‘cha yonida',     ru: 'Рядом детсад',       en: 'Near kindergarten' } },
  { key: 'water',        emoji: '💧', label: { uz: 'Suv bo‘yida',        ru: 'У воды',             en: 'Near water' } },
  { key: 'park',         emoji: '🌳', label: { uz: 'Park / yashil hudud', ru: 'Парк / зелёная зона', en: 'Park / greenery' } },
  { key: 'hospital',     emoji: '🏥', label: { uz: 'Shifoxona yaqin',    ru: 'Рядом больница',     en: 'Near hospital' } },
  { key: 'shopping',     emoji: '🛒', label: { uz: 'Savdo markazi',      ru: 'Торговый центр',     en: 'Shopping center' } },
  { key: 'transport',    emoji: '🚌', label: { uz: 'Transport yaqin',    ru: 'Рядом транспорт',    en: 'Near transport' } },
  { key: 'mosque',       emoji: '🕌', label: { uz: 'Masjid yaqin',       ru: 'Рядом мечеть',       en: 'Near mosque' } },
];

export const categoryLabel = (key: string, lang: Locale): string => {
  const c = CATEGORIES.find((x) => x.key === key);
  return c ? c.label[lang] || c.label.uz : key;
};

export const categoryEmoji = (key: string): string =>
  CATEGORIES.find((x) => x.key === key)?.emoji || '📍';
