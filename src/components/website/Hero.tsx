/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';
import { responsive } from '@/lib/responsiveImg';

type HeroSlide = { image: string; name: string; id: number; city?: string };
export type HeroAvailability = { id: number; name: string; free: number };

/*
  Bosh sahifa hero — kontekstli: sotuvdagi blokning haqiqiy rasmi, bitta asosiy CTA (xonadon tanlash)
  va bazadan olingan jonli "hozir sotuvda" paneli. Tasdiqlanmagan raqamlar (mijoz soni, "a'lo sifat")
  ko'rsatilmaydi. Slayder va animatsiya yo'q — birinchi ekran tez ochiladi (LCP rasm darhol yuklanadi).
*/

// DB'da rasm qolmasa — tekshirilgan haqiqiy rasm
const FALLBACK_IMAGE = '/uploads/majmua-1.jpg';
const isGood = (src?: string | null) => Boolean(src) && !String(src).includes('nfull');

const T = {
  uz: {
    place: 'Urganch · Shovot kanali bo‘yida',
    title: 'Kanal bo‘yidagi zamonaviy uylar',
    desc: 'Bo‘sh xonadonlarni blok, qavat va xonalar soni bo‘yicha tanlang. Narx va qolgan summani menejer aytadi.',
    cta: 'Xonadon tanlash',
    call: 'Qo‘ng‘iroq qilish',
    now: 'Hozir sotuvda',
    free: (n: number) => `${n} ta bo‘sh`,
    none: 'Bo‘sh xonadonlar ro‘yxati yangilanmoqda',
    total: (n: number) => `Jami ${n} ta bo‘sh xonadon`,
  },
  ru: {
    place: 'Ургенч · у канала Шават',
    title: 'Современные дома у канала',
    desc: 'Выберите свободную квартиру по блоку, этажу и числу комнат. Цену и остаток суммы сообщит менеджер.',
    cta: 'Выбрать квартиру',
    call: 'Позвонить',
    now: 'Сейчас в продаже',
    free: (n: number) => `${n} свободно`,
    none: 'Список свободных квартир обновляется',
    total: (n: number) => `Всего свободно: ${n}`,
  },
  en: {
    place: 'Urgench · on the Shovot canal',
    title: 'Modern homes by the canal',
    desc: 'Pick an available apartment by block, floor and number of rooms. A manager will share the price and remaining amount.',
    cta: 'Choose an apartment',
    call: 'Call us',
    now: 'Available now',
    free: (n: number) => `${n} available`,
    none: 'The list of available apartments is being updated',
    total: (n: number) => `${n} apartments available`,
  },
};

export default function Hero({ lang, heroTitle, heroDesc, slides = [], availability = [], phone = '+998 91 011 66 66', ctaHref, tour }: {
  lang: Locale;
  heroTitle?: string;
  heroDesc?: string;
  slides?: HeroSlide[];
  availability?: HeroAvailability[];
  phone?: string;
  ctaHref?: string;
  tour?: { href: string; label: string };   // alohida 3D tur sahifasi (ikkinchi darajali havola)
}) {
  const t = T[lang as keyof typeof T] || T.uz;
  // Admin kiritgan sarlavha/tavsif faqat o'zbekcha (boshqa tilda o'zbek matni chiqmasin)
  const title = lang === 'uz' && heroTitle ? heroTitle : t.title;
  const desc = lang === 'uz' && heroDesc ? heroDesc : t.desc;
  const image = slides.find((s) => isGood(s.image))?.image || FALLBACK_IMAGE;
  const img = responsive(image, '100vw');
  // To'liq ekranli fon ustida to'q qatlam bor — 1280 px WebP yetarli, asl (bir necha MB) JPG taklif qilinmaydi
  const srcSet = img.srcSet?.split(', ').filter((x) => x.includes('/_w/')).join(', ');
  const tel = 'tel:' + phone.replace(/[^\d+]/g, '');
  const selling = availability.filter((a) => a.free > 0);
  const totalFree = selling.reduce((s, a) => s + a.free, 0);

  return (
    <section className="relative isolate min-h-[88svh] flex items-end bg-inverse text-ink-inverse overflow-hidden">
      <img
        src={img.src}
        srcSet={srcSet}
        sizes={img.sizes}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Matn ostida pastdan to'q qatlam — rasm qanday bo'lmasin kontrast saqlanadi */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#014242] via-[#014242]/70 to-[#014242]/20" aria-hidden="true" />

      <div className="w-full max-w-page mx-auto px-[var(--v-gutter)] pb-12 pt-32 md:pb-20 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="text-caption uppercase text-ink-inverse-muted">{t.place}</p>
          <h1 className="mt-4 text-display font-montserrat max-w-[14ch]">{title}</h1>
          <p className="mt-6 text-body-lg text-ink-inverse-muted max-w-[52ch]">{desc}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href={ctaHref || `/${lang}#xonadon-tanlash`}
              className="inline-flex items-center gap-2 min-h-[52px] px-7 rounded-full bg-cta text-cta-ink font-bold text-body shadow-v-md hover:brightness-105 active:scale-[0.98] transition duration-v-fast ease-v"
            >
              {t.cta} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {tour && <Link href={tour.href} className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4">{tour.label}</Link>}
            {/* Keng ekranda telefon navbar'da turadi — bu yerda takrorlanmaydi */}
            <a href={tel} className="xl:hidden inline-flex items-center gap-2 min-h-[44px] font-semibold underline-offset-4 hover:underline">
              <Phone size={18} aria-hidden="true" /> {phone}
            </a>
          </div>
        </div>

        {/* Yagona glass panel: bazadagi jonli bo'sh xonadonlar soni */}
        <aside className="lg:col-span-4 lg:col-start-9 rounded-v-lg border border-line-inverse bg-[#014242]/60 backdrop-blur-md p-5" aria-label={t.now}>
          <p className="text-caption uppercase text-ink-inverse-muted">{t.now}</p>
          {selling.length ? (
            <>
              <ul className="mt-3 divide-y divide-white/10">
                {selling.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-body">
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-ink-inverse-muted">{t.free(a.free)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-small text-ink-inverse-muted">{t.total(totalFree)}</p>
            </>
          ) : (
            <p className="mt-3 text-small text-ink-inverse-muted">{t.none}</p>
          )}
        </aside>
      </div>
    </section>
  );
}
