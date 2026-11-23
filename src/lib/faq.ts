import { standardMonthly } from './paymentCalc';

/*
  Ko'p beriladigan savollar — sahifada ko'rinadi va FAQPage (JSON-LD) sifatida qidiruv tizimlari hamda
  AI yordamchilarga beriladi. Faqat tekshirsa bo'ladigan ma'lumot: to'lov summalari admin sozlamalaridan,
  qolgani kompaniyaning rasmiy e'lonlaridan (t.me/voharesidence). Narx yozilmaydi.
*/
export type Faq = { q: string; a: string };

const mln = (v: number) => (v / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 });

export function getFaq(lang: string, s: Record<string, string>, c: { phone: string; phone2?: string; address: string; hours: string }): Faq[] {
  const m = [1, 2, 3, 4].map((r) => mln(standardMonthly(r, s)));
  const phones = [c.phone, c.phone2].filter(Boolean).join(', ');
  if (lang === 'ru') {
    return [
      { q: 'Где находится Voha Residence?', a: `Жилые блоки Voha Residence находятся в центре Ургенча (Хорезмская область, Узбекистан), у канала Шават. Офис продаж: ${c.address}.` },
      { q: 'Какой ежемесячный платёж?', a: `Платёж стандартный и зависит от числа комнат: 1-комнатная — ${m[0]} млн сум, 2-комнатная — ${m[1]} млн, 3-комнатная — ${m[2]} млн, 4 и более комнат — ${m[3]} млн сум в месяц.` },
      { q: 'Сколько стоит квартира?', a: 'Цена зависит от блока, этажа и площади. Точную цену и остаток суммы сообщает менеджер: оставьте номер телефона на сайте или позвоните.' },
      { q: 'Есть ли кадастровые документы?', a: 'Да. Квартиры в готовых блоках продаются с готовым кадастром.' },
      { q: 'Квартиры с ремонтом или без?', a: 'Есть оба варианта: без ремонта и с готовым ремонтом.' },
      { q: 'Можно ли посмотреть квартиру?', a: 'Да. Запишитесь на просмотр через сайт или по телефону; также проводятся дни открытых дверей на стройке.' },
      { q: 'Как связаться с отделом продаж?', a: `Телефоны: ${phones}. Время работы: ${c.hours}. Также можно написать в Telegram @voharesidence или Instagram @voha_residence.` },
    ];
  }
  if (lang === 'en') {
    return [
      { q: 'Where is Voha Residence located?', a: `Voha Residence blocks are in central Urgench (Khorezm region, Uzbekistan), on the Shovot canal. Sales office: ${c.address}.` },
      { q: 'What is the monthly payment?', a: `It is a standard amount that depends on the number of rooms: 1 room — ${m[0]} mln UZS, 2 rooms — ${m[1]} mln, 3 rooms — ${m[2]} mln, 4 or more rooms — ${m[3]} mln UZS per month.` },
      { q: 'How much does an apartment cost?', a: 'The price depends on the block, floor and area. A manager gives the exact price and remaining amount: leave your phone number on the site or call.' },
      { q: 'Are cadastre documents ready?', a: 'Yes. Apartments in completed blocks are sold with cadastre documents.' },
      { q: 'Are apartments finished or unfinished?', a: 'Both: shell apartments and apartments with finished renovation.' },
      { q: 'Can I see an apartment?', a: 'Yes. Book a viewing on the site or by phone; open days are also held on the construction site.' },
      { q: 'How do I contact the sales office?', a: `Phones: ${phones}. Working hours: ${c.hours}. You can also write on Telegram @voharesidence or Instagram @voha_residence.` },
    ];
  }
  return [
    { q: 'Voha Residence qayerda joylaşgan?', a: `Voha Residence bloklari Urganç şahri markazida (Xorazm viloyati), Şovot kanali böyida joylaşgan. Sotuv ofisi: ${c.address}.` },
    { q: 'Oylik tölov qança?', a: `Oylik tölov standart va xonalar soniga boğliq: 1 xonali — ${m[0]} mln söm, 2 xonali — ${m[1]} mln, 3 xonali — ${m[2]} mln, 4 va undan köp xonali — ${m[3]} mln söm.` },
    { q: 'Xonadon narxi qança?', a: 'Narx blok, qavat va maydonga boğliq. Aniq narx va qolgan summani menejer aytadi: saytda telefon raqamingizni qoldiring yoki qönğiroq qiling.' },
    { q: 'Kadastr hujjatlari tayyormi?', a: 'Ha. Tayyor bloklardagi xonadonlar kadastr hujjatlari bilan sotiladi.' },
    { q: 'Xonadonlar ta’mirlimi?', a: 'Ikki xil: ta’mirsiz va tayyor ta’mirli xonadonlar bor.' },
    { q: 'Xonadonni borib körsa böladimi?', a: 'Ha. Sayt yoki telefon orqali körişga yoziling; quriliş maydonida oçiq eşiklar kunlari ham ötkaziladi.' },
    { q: 'Sotuv bölimi bilan qanday boğlanaman?', a: `Telefonlar: ${phones}. Iş vaqti: ${c.hours}. Telegram: @voharesidence, Instagram: @voha_residence.` },
  ];
}

export const faqJsonLd = (items: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// <script type="application/ld+json"> ichiga xavfsiz qo'yish uchun
export const ldString = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');
