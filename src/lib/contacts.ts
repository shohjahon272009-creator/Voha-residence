import { getPublicSettings } from './settings';

/*
  Saytdagi aloqa ma'lumotlari — admin "Sozlamalar"dan (bo'sh bo'lsa standart qiymat).
  Avval menyu, footer, qo'ng'iroq tugmasi va boshqa joylarda raqam kodga qattiq yozilgan edi.
*/
export const DEFAULT_PHONE = '+998 91 011 66 66';
export const DEFAULT_PHONE2 = '+998 97 321 66 66';

export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '');

// "Xonadon tanlash" CTA manzili: tanlovchi bosh sahifada yoqilgan bo'lsa — o'sha bo'lim,
// admin uni o'chirgan bo'lsa (show_search) — "Xonadonlar" sahifasi (u yerda doim bor)
export const pickerHref = (lang: string, s: Record<string, string>) =>
  s.show_search !== 'false' ? `/${lang}#xonadon-tanlash` : `/${lang}/apartments#xonadon-tanlash`;

export async function getContacts() {
  const s = await getPublicSettings();
  const phone = (s.contact_phone || '').trim() || DEFAULT_PHONE;
  const phone2 = s.contact_phone2 === undefined ? DEFAULT_PHONE2 : s.contact_phone2.trim();
  return { phone, phone2, address: (s.contact_address || '').trim() };
}
