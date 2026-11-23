import React from 'react';
import { Locale } from '@/lib/dictionaries';

/*
  "Majmua haqida" — faqat tekshirsa bo'ladigan faktlar: loyihalar soni bazadan, standart oylik to'lov
  sozlamalardan. Mijoz soni, mukofot, "a'lo sifat" kabi tasdiqlanmagan da'volar yo'q.
  Editorial ko'rinish: kartalar emas, ustunlar va ingichka chiziqlar.
*/

const T = {
  uz: {
    kicker: 'Majmua haqida',
    title: 'Shahar ichida, kanal bo‘yida',
    lead: 'Voha Residence — Urganch shahridagi turar-joy bloklari. Har bir blokda bo‘sh xonadonlar ro‘yxati sotuv bazasidan yangilanib turadi.',
    cols: (p: { total: number; done: number; selling: number; monthlyFrom: string }) => [
      { k: 'Joylashuv', v: 'Urganch', d: 'Shovot kanali bo‘yidagi bloklar. Aniq manzil va ko‘rish vaqtini menejer aytadi.' },
      { k: 'Loyihalar', v: `${p.total} ta`, d: `${p.done} tasi topshirilgan, ${p.selling} tasida hozir sotuv bor.` },
      { k: 'To‘lov', v: `${p.monthlyFrom} dan`, d: 'Oyiga standart to‘lov, xonalar soniga qarab. Qolgan summani menejer hisoblaydi.' },
    ],
  },
  ru: {
    kicker: 'О комплексе',
    title: 'В городе, у канала',
    lead: 'Voha Residence — жилые блоки в Ургенче. Список свободных квартир в каждом блоке обновляется из базы продаж.',
    cols: (p: { total: number; done: number; selling: number; monthlyFrom: string }) => [
      { k: 'Расположение', v: 'Ургенч', d: 'Блоки у канала Шават. Точный адрес и время показа сообщит менеджер.' },
      { k: 'Проекты', v: `${p.total}`, d: `${p.done} сдано, в ${p.selling} сейчас идут продажи.` },
      { k: 'Оплата', v: `от ${p.monthlyFrom}`, d: 'Стандартный ежемесячный платёж, зависит от числа комнат. Остаток рассчитает менеджер.' },
    ],
  },
  en: {
    kicker: 'About the complex',
    title: 'In the city, by the canal',
    lead: 'Voha Residence is a set of residential blocks in Urgench. The list of available apartments in each block is updated from the sales database.',
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
      </div>
    </section>
  );
}
