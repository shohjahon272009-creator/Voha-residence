import type { Metadata } from 'next';

/*
  Har bir sahifa uchun SEO metadata: o'z sarlavhasi/tavsifi, TO'G'RI canonical
  (avval root layout hamma sahifaga canonical '/' berardi — Google ichki sahifalarni
  bosh sahifaning nusxasi deb hisoblashi mumkin edi) va 3 til uchun hreflang.
*/

const SITE = 'https://www.voharesidence.uz';
const LANGS = ['uz', 'ru', 'en'] as const;
const OG_IMAGE = '/cinema/poster.jpg'; // 1920px HD render — ijtimoiy tarmoqlarda chiroyli preview

type Texts = Record<string, { title: string; description: string }>;

export function pageMetadata(lang: string, path: string, texts: Texts, image?: string): Metadata {
  const t = texts[lang] || texts.uz;
  const url = `/${lang}${path}`;
  const languages: Record<string, string> = Object.fromEntries(LANGS.map((l) => [l, `/${l}${path}`]));
  languages['x-default'] = `/uz${path}`;
  const img = image || OG_IMAGE;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: t.title,
      description: t.description,
      url: `${SITE}${url}`,
      images: [{ url: img, width: 1920, height: 1080, alt: t.title }],
      type: 'website',
      siteName: 'Voha Residence',
      locale: lang === 'ru' ? 'ru_RU' : lang === 'en' ? 'en_US' : 'uz_UZ',
    },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description, images: [img] },
  };
}

export const PAGE_SEO: Record<string, Texts> = {
  home: {
    uz: { title: 'Voha Residence — Urganchda yangi xonadonlar, 0% foizli muddatli to‘lov', description: '15 yillik tajribaga ega qurilish kompaniyasi. Shovot kanali bo‘yida, Urganch markazida kadastri tayyor xonadonlar: boshlang‘ich to‘lov 15% dan, oylik 4 mln so‘mdan, bank foizisiz.' },
    ru: { title: 'Voha Residence — новостройки в Ургенче, рассрочка без процентов', description: 'Строительная компания с 15-летним опытом. Квартиры с готовым кадастром в центре Ургенча у канала Шават: взнос от 15%, от 4 млн сумов в месяц, без банковских процентов.' },
    en: { title: 'Voha Residence — new apartments in Urgench, 0% installment plan', description: 'A construction company with 15 years of experience. Cadastre-ready apartments in central Urgench on the Shovot canal: from 15% down, from 4M UZS a month, no bank interest.' },
  },
  projects: {
    uz: { title: 'Loyihalarimiz — Voha Residence', description: 'Voha Residence turar-joy majmualari: Shovot kanali bo‘yidagi bloklar, “Sokin Makon”, “Yangi O‘zbekiston” massivi va topshirilgan uylar.' },
    ru: { title: 'Наши проекты — Voha Residence', description: 'Жилые комплексы Voha Residence: блоки у канала Шават, «Sokin Makon», массив «Янги Узбекистан» и сданные дома.' },
    en: { title: 'Our Projects — Voha Residence', description: 'Voha Residence residential complexes: Shovot canal blocks, “Sokin Makon”, the “Yangi Uzbekistan” district and completed buildings.' },
  },
  apartments: {
    uz: { title: 'Xonadonlar — narx va to‘lovni hisoblash | Voha Residence', description: 'Blok, qavat va xonalar soni bo‘yicha xonadon tanlang: 1, 2 va 3 xonali uylar. To‘lovni darhol hisoblang — 0% foiz, boshlang‘ich 15% dan.' },
    ru: { title: 'Квартиры — цены и расчёт платежа | Voha Residence', description: 'Выберите квартиру по блоку, этажу и числу комнат: 1, 2 и 3-комнатные. Рассчитайте платёж сразу — 0% переплаты, взнос от 15%.' },
    en: { title: 'Apartments — prices & payment calculator | Voha Residence', description: 'Choose by block, floor and rooms: 1, 2 and 3-room apartments. Calculate your payment instantly — 0% interest, from 15% down.' },
  },
  about: {
    uz: { title: 'Biz haqimizda — 15 yillik tajriba | Voha Residence', description: '2013-yildan beri: savdo majmualari, davlat obyektlari, “Arda Xiva” majmuasi va Urganchdagi zamonaviy turar-joylar. 200 dan ortiq oila tanlovi.' },
    ru: { title: 'О нас — 15 лет опыта | Voha Residence', description: 'С 2013 года: торговые комплексы, гособъекты, комплекс «Arda Xiva» и современное жильё в Ургенче. Выбор более 200 семей.' },
    en: { title: 'About us — 15 years of experience | Voha Residence', description: 'Since 2013: shopping complexes, public buildings, the “Arda Xiva” complex and modern housing in Urgench. Chosen by 200+ families.' },
  },
  news: {
    uz: { title: 'Yangiliklar va aksiyalar — Voha Residence', description: 'Qurilish jarayoni, yangi loyihalar, chegirma va aksiyalar haqida so‘nggi yangiliklar.' },
    ru: { title: 'Новости и акции — Voha Residence', description: 'Последние новости о ходе строительства, новых проектах, скидках и акциях.' },
    en: { title: 'News & offers — Voha Residence', description: 'Latest news on construction progress, new projects, discounts and offers.' },
  },
  contact: {
    uz: { title: 'Aloqa — sotuv ofisi manzili | Voha Residence', description: 'Sotuv ofisi: Urganch, Ekstrenniy shifoxonasi chorrahasi. Telefon: +998 91 011 66 66, +998 97 321 66 66.' },
    ru: { title: 'Контакты — офис продаж | Voha Residence', description: 'Офис продаж: Ургенч, перекрёсток у больницы экстренной помощи. Тел.: +998 91 011 66 66, +998 97 321 66 66.' },
    en: { title: 'Contact — sales office | Voha Residence', description: 'Sales office: Urgench, Emergency Hospital crossroads. Phone: +998 91 011 66 66, +998 97 321 66 66.' },
  },
};
