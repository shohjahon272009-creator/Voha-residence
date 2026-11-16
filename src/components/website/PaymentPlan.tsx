import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';
import { standardMonthly } from '@/lib/paymentCalc';

/*
  To'lov tartibi — egasi tasdiqlagan qoida: oylik to'lov xonalar soniga qarab standart summa
  (admin sozlamalari: pay_monthly_1..4). Boshlang'ich to'lov foizi blokka bog'liq, shuning uchun
  aniq qiymati xonadon tanlanganda ko'rsatiladi. Narx va qolgan summa saytda yo'q — menejer aytadi.
  Animatsiya va hisoblagich yo'q: raqamlar JavaScript'siz ham to'g'ri ko'rinadi.
*/

const T = {
  uz: {
    kicker: "To'lov tartibi",
    title: "Boshlang'ich to'lov, keyin har oy bir xil summa",
    lead: "Oylik to'lov xonalar soniga qarab belgilangan. Boshlang'ich to'lov foizi blokka bog'liq — xonadonni tanlaganingizda ko'rsatiladi.",
    rooms: (n: number) => (n >= 4 ? '4 va undan ko‘p xonali' : `${n} xonali`),
    perMonth: "mln so'm / oy",
    tableCaption: "Standart oylik to'lov",
    steps: [
      { k: '1', t: "Boshlang'ich to'lov", d: "Blokka qarab foizda. Xonadon detalida ko'rasiz." },
      { k: '2', t: "Oylik to'lov", d: 'Jadvaldagi standart summa, har oy.' },
      { k: '3', t: 'Qolgan summa', d: "Menejer hisoblab beradi — murojaat qoldiring." },
    ],
    cta: 'Xonadon tanlash',
    note: 'Yakuniy shartlar shartnomada belgilanadi.',
  },
  ru: {
    kicker: 'Порядок оплаты',
    title: 'Первый взнос, затем одинаковая сумма каждый месяц',
    lead: 'Ежемесячный платёж зависит от числа комнат. Процент первого взноса зависит от блока — он показывается при выборе квартиры.',
    rooms: (n: number) => (n >= 4 ? '4 и более комнат' : `${n}-комнатная`),
    perMonth: 'млн сум / мес.',
    tableCaption: 'Стандартный ежемесячный платёж',
    steps: [
      { k: '1', t: 'Первый взнос', d: 'В процентах, зависит от блока. Виден в карточке квартиры.' },
      { k: '2', t: 'Ежемесячный платёж', d: 'Стандартная сумма из таблицы, каждый месяц.' },
      { k: '3', t: 'Остаток суммы', d: 'Рассчитает менеджер — оставьте заявку.' },
    ],
    cta: 'Выбрать квартиру',
    note: 'Окончательные условия фиксируются в договоре.',
  },
  en: {
    kicker: 'How payment works',
    title: 'A down payment, then the same amount every month',
    lead: 'The monthly payment depends on the number of rooms. The down payment percentage depends on the block and is shown when you pick an apartment.',
    rooms: (n: number) => (n >= 4 ? '4+ rooms' : `${n} room${n > 1 ? 's' : ''}`),
    perMonth: 'mln UZS / month',
    tableCaption: 'Standard monthly payment',
    steps: [
      { k: '1', t: 'Down payment', d: 'A percentage that depends on the block. Shown in the apartment details.' },
      { k: '2', t: 'Monthly payment', d: 'The standard amount from the table, every month.' },
      { k: '3', t: 'Remaining amount', d: 'Calculated by a manager — leave a request.' },
    ],
    cta: 'Choose an apartment',
    note: 'Final terms are set in the contract.',
  },
};

// 4 000 000 -> "4", 4 500 000 -> "4,5"
const mln = (v: number) => (v / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 });

export default function PaymentPlan({ lang, settings, ctaHref }: { lang: Locale; settings: Record<string, string>; ctaHref?: string }) {
  const t = T[lang as keyof typeof T] || T.uz;
  return (
    <section id="tolov" className="bg-inverse text-ink-inverse py-[var(--v-section-y)]">
      <div className="max-w-page mx-auto px-[var(--v-gutter)] grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-caption uppercase text-ink-inverse-muted">{t.kicker}</p>
          <h2 className="mt-4 text-h1 font-montserrat">{t.title}</h2>
          <p className="mt-6 text-body-lg text-ink-inverse-muted max-w-[52ch]">{t.lead}</p>
          <Link
            href={ctaHref || `/${lang}#xonadon-tanlash`}
            className="mt-8 inline-flex items-center gap-2 min-h-[52px] px-7 rounded-full bg-cta text-cta-ink font-bold shadow-v-md hover:brightness-105 active:scale-[0.98] transition duration-v-fast ease-v"
          >
            {t.cta} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <table className="w-full text-left">
            <caption className="text-caption uppercase text-ink-inverse-muted text-left pb-3">{t.tableCaption}</caption>
            <tbody>
              {[1, 2, 3, 4].map((r) => (
                <tr key={r} className="border-t border-line-inverse">
                  <th scope="row" className="py-4 pr-4 text-body font-normal text-ink-inverse-muted">{t.rooms(r)}</th>
                  <td className="py-4 text-right whitespace-nowrap">
                    <span className="text-h2 font-montserrat tabular-nums">{mln(standardMonthly(r, settings))}</span>
                    <span className="ml-2 text-small text-ink-inverse-muted">{t.perMonth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ol className="lg:col-span-12 grid gap-8 md:grid-cols-3 border-t border-line-inverse pt-8">
          {t.steps.map((s) => (
            <li key={s.k} className="md:border-l md:border-line-inverse md:pl-6 first:md:border-l-0 first:md:pl-0">
              <span className="text-caption text-ink-inverse-muted" aria-hidden="true">0{s.k}</span>
              <h3 className="mt-2 text-h3">{s.t}</h3>
              <p className="mt-2 text-body text-ink-inverse-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="lg:col-span-12 text-small text-ink-inverse-muted">{t.note}</p>
      </div>
    </section>
  );
}
