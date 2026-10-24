import { getPublicSettings } from './settings';

/*
  Saytdagi aloqa ma'lumotlari — admin "Sozlamalar"dan (bo'sh bo'lsa standart qiymat).
  Avval menyu, footer, qo'ng'iroq tugmasi va boshqa joylarda raqam kodga qattiq yozilgan edi.
*/
export const DEFAULT_PHONE = '+998 91 011 66 66';
export const DEFAULT_PHONE2 = '+998 97 321 66 66';

export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '');

export async function getContacts() {
  const s = await getPublicSettings();
  const phone = (s.contact_phone || '').trim() || DEFAULT_PHONE;
  const phone2 = s.contact_phone2 === undefined ? DEFAULT_PHONE2 : s.contact_phone2.trim();
  return { phone, phone2, address: (s.contact_address || '').trim() };
}
