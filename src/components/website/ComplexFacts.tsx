import React from 'react';
import { Locale } from '@/lib/dictionaries';

/*
  "Majmua haqida" — faqat tekshirsa bo'ladigan faktlar: loyihalar soni bazadan, standart oylik to'lov
  sozlamalardan. Mijoz soni, mukofot, "a'lo sifat" kabi tasdiqlanmagan da'volar yo'q.
  Editorial ko'rinish: kartalar emas, ustunlar va ingichka chiziqlar.
  "Xaridor uchun" ro'yxati kompaniyaning rasmiy Telegram kanalidagi (t.me/voharesidence) e'lonlardan olingan.
*/

const INTERVIEW_URL = 'https://youtu.be/sH9SmnEh2Ik';

const T = {
  uz: {
    kicker: 'Majmua haqida',
    title: 'Şahar içida, kanal böyida',
    lead: 'Voha Residence 15 yildan beri Xorazmda quradi. Urgançdagi bloklar şahar markazida: universitet, maktab, yaşil boğ va dökonlar yonida.',
    forBuyer: 'Xaridor uçun',
    points: [
      ['Kadastr hujjatlari tayyor', 'Tayyor bloklardagi xonadonlar kadastri bilan sotiladi.'],
      ['Tayyor ta’mirli xonadonlar', 'Ta’mirsiz ham, tayyor ta’mir bilan ham tanlaş mumkin.'],
      ['Muddatli tölov', 'Boşlanğiç tölovdan keyin har oy standart summa.'],
      ['Qurilişni özingiz körasiz', 'Oçiq eşiklar kunida binoga çiqib, xonadonni köriş mumkin.'],
    ],
    interview: 'Quruvçi bilan oçiq suhbat (YouTube)',
    cols: (p: { total: number; done: number; selling: number; monthlyFrom: string }) => [
      { k: 'Joylaşuv', v: 'Urganç', d: 'Şovot kanali böyidagi bloklar. Aniq manzil va köriş vaqtini menejer aytadi.' },
      { k: 'Loyihalar', v: `${p.total} ta`, d: `${p.done} tasi topşirilgan, ${p.selling} tasida hozir sotuv bor.` },
      { k: 'Tölov', v: `${p.monthlyFrom} dan`, d: 'Oyiga standart tölov, xonalar soniga qarab. Qolgan summani menejer hisoblaydi.' },
    ],
  },
  ru: {
    kicker: 'О комплексе',
    title: 'В городе, у канала',
    lead: 'Voha Residence строит в Хорезме 15 лет. Блоки в Ургенче находятся в центре города: рядом университет, школа, зелёный парк и магазины.',
    forBuyer: 'Покупателю',
    points: [
      ['Кадастр готов', 'Квартиры в готовых блоках продаются с кадастровыми документами.'],
      ['Квартиры с ремонтом', 'Можно выбрать без ремонта или с готовым ремонтом.'],
      ['Рассрочка', 'После первого взноса — стандартная сумма каждый месяц.'],
      ['Стройку можно увидеть', 'В день открытых дверей можно подняться в дом и посмотреть квартиру.'],
    ],
    interview: 'Открытый разговор с застройщиком (YouTube)',
    cols: (p: { total: number; done: number; selling: number; monthlyFrom: string }) => [
      { k: 'Расположение', v: 'Ургенч', d: 'Блоки у канала Шават. Точный адрес и время показа сообщит менеджер.' },
      { k: 'Проекты', v: `${p.total}`, d: `${p.done} сдано, в ${p.selling} сейчас идут продажи.` },
      { k: 'Оплата', v: `от ${p.monthlyFrom}`, d: 'Стандартный ежемесячный платёж, зависит от числа комнат. Остаток рассчитает менеджер.' },
    ],
  },
  en: {
    kicker: 'About the complex',
    title: 'In the city, by the canal',
    lead: 'Voha Residence has been building in Khorezm for 15 years. The Urgench blocks are in the city centre, next to the university, a school, a green park and shops.',
    forBuyer: 'For buyers',
    points: [
      ['Cadastre documents ready', 'Apartments in completed blocks are sold with cadastre documents.'],
      ['Finished apartments', 'Choose a shell apartment or one with finished renovation.'],
      ['Instalment plan', 'After the down payment, a standard amount every month.'],
      ['See the construction yourself', 'On open days you can go up into the building and see the apartment.'],
    ],
    interview: 'An open talk with the developer (YouTube)',
    cols: (p: { total: number; done: number; selling: number; monthlyFrom: string }) => [
      { k: 'Location', v: 'Urgench', d: 'Blocks on the Shovot canal. A manager will share the exact address and viewing time.' },
      { k: 'Projects', v: `${p.total}`, d: `${p.done} delivered, ${p.selling} currently on sale.` },
      { k: 'Payment', v: `from ${p.monthlyFrom}`, d: 'Standard monthly payment depending on the number of rooms. A manager calculates the rest.' },
    ],
  },
};

export default function ComplexFacts({ lang, total, done, selling, monthlyFrom }: {
  lang: Locale; total: number; done: number; selling: number; monthlyFrom: string;
}) {
  const t = T[lang as keyof typeof T] || T.uz;
  return (
    <section id="majmua" className="bg-canvas text-ink py-[var(--v-section-y)]">
      <div className="max-w-page mx-auto px-[var(--v-gutter)] grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-small font-semibold text-accent-text">{t.kicker}</p>
          <h2 className="mt-4 text-h1 font-montserrat">{t.title}</h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 self-end text-body-lg text-ink-muted">{t.lead}</p>
        <dl className="lg:col-span-12 grid gap-8 md:grid-cols-3 border-t border-line pt-8">
          {t.cols({ total, done, selling, monthlyFrom }).map((c) => (
            <div key={c.k} className="md:border-l md:border-line md:pl-6 first:md:border-l-0 first:md:pl-0">
              <dt className="text-caption uppercase text-ink-muted">{c.k}</dt>
              <dd className="mt-3 text-h2 font-montserrat">{c.v}</dd>
              <dd className="mt-2 text-body text-ink-muted">{c.d}</dd>
            </div>
          ))}
        </dl>

        <div className="lg:col-span-12 grid gap-10 lg:grid-cols-12 border-t border-line pt-10">
          <div className="lg:col-span-4">
            <h3 className="text-h2 font-montserrat">{t.forBuyer}</h3>
            <a href={INTERVIEW_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-accent-text underline underline-offset-4">
              {t.interview}
            </a>
          </div>
          <ul className="lg:col-span-8 grid gap-x-10 sm:grid-cols-2">
            {t.points.map(([head, text], i) => (
              <li key={head} className="border-b border-line py-5">
                <p className="text-small text-ink-muted tabular-nums">0{i + 1}</p>
                <p className="mt-1 text-h3 font-montserrat">{head}</p>
                <p className="mt-1 text-body text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
