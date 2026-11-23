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
    place: 'Urganç · Şovot kanali böyida',
    title: 'Kanal böyidagi zamonaviy uylar',
    desc: 'Böş xonadonlarni blok, qavat va xonalar soni böyiça tanlang. Narx va qolgan summani menejer aytadi.',
    cta: 'Xonadon tanlaş',
    call: 'Qönğiroq qiliş',
    now: 'Hozir sotuvda',
    free: (n: number) => `${n} ta böş`,
    none: 'Böş xonadonlar röyxati yangilanmoqda',
    total: (n: number) => `Jami ${n} ta böş xonadon`,
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

  return (
    <section className="relative isolate min-h-[100svh] flex flex-col justify-end bg-inverse text-ink-inverse overflow-hidden">
      <img
        src={img.src}
        srcSet={srcSet}
        sizes={img.sizes}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Rasm ochiq qoladi: faqat pastki yarmi qorayadi (matn kontrasti uchun), tepada navbar uchun yengil soya */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#014242] from-[18%] via-[#014242]/55 via-[52%] to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/45 to-transparent" aria-hidden="true" />

      <div className="w-full max-w-page mx-auto px-[var(--v-gutter)] pt-32 pb-10">
        <p className="text-small font-semibold text-ink-inverse-muted">{t.place}</p>
        <h1 className="mt-4 text-display font-montserrat max-w-[15ch]">{title}</h1>
        <p className="mt-5 text-body-lg text-ink-inverse-muted max-w-[50ch]">{desc}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href={ctaHref || `/${lang}#xonadon-tanlash`}
            className="inline-flex items-center gap-2 min-h-[52px] px-7 rounded-full bg-cta text-cta-ink font-bold text-body hover:brightness-105 active:scale-[0.98] transition duration-v-fast ease-v"
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

      {/* Sotuvdagi bloklar qatori: bazadagi bo'sh xonadonlar soni, bosilganda o'sha blok ochiladi */}
      <nav aria-label={t.now} className="w-full border-t border-line-inverse">
        <div className="max-w-page mx-auto px-[var(--v-gutter)]">
          {selling.length ? (
            <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-[var(--v-gutter)] pl-[calc(var(--v-gutter)-1.25rem)] pr-24 lg:-mx-6 lg:px-0">
              {selling.slice(0, 6).map((a) => (
                <li key={a.id} className="shrink-0 lg:flex-1 border-l border-line-inverse first:border-l-0">
                  <Link href={`/${lang}#xonadon=${a.id}`} className="block min-h-[72px] px-5 py-4 lg:px-6 hover:bg-white/5 transition-colors duration-v-base">
                    <span className="block font-montserrat text-h3 whitespace-nowrap">{a.name}</span>
                    <span className="block text-small text-ink-inverse-muted whitespace-nowrap">{t.free(a.free)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-5 text-small text-ink-inverse-muted">{t.none}</p>
          )}
        </div>
      </nav>
    </section>
  );
}
