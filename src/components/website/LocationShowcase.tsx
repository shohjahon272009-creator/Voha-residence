'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone, Clock, GraduationCap, School, HeartPulse, Baby, Trees, Landmark, Map as MapIcon } from 'lucide-react';

/*
  Lokatsiya — "Hamma narsa bir qadam narida".
  Markaz: sotuv ofisi (Ekstrenniy shifoxonasi chorrahasi). Atrofdagi obyektlar va masofalar —
  OpenStreetMap ma'lumotlari (2026-10), to'g'ri chiziq bo'yicha hisoblangan; noto'g'ri belgilangan
  obyektlar (masalan, "bog'cha" deb yozilgan to'yxona) chiqarib tashlangan.
  Radar-xarita SVG — tez, tiniq; og'ir Google xarita faqat tugma bosilganda ochiladi.
*/

type Kind = 'school' | 'hospital' | 'kindergarten' | 'park' | 'university' | 'mosque';
type Place = { kind: Kind; lat: number; lng: number; name: Record<string, string> };

const CENTER = { lat: 41.544716, lng: 60.599816 };
const RADIUS_M = 1500;

const PLACES: Place[] = [
  { kind: 'school', lat: 41.54749, lng: 60.6014, name: { uz: '4-son maktab', ru: 'Школа №4', en: 'School No. 4' } },
  { kind: 'hospital', lat: 41.54592, lng: 60.60383, name: { uz: 'Tez tibbiy yordam markazi', ru: 'Центр экстренной медпомощи', en: 'Emergency medical center' } },
  { kind: 'kindergarten', lat: 41.54845, lng: 60.60119, name: { uz: "Bolalar bog'chasi", ru: 'Детский сад', en: 'Kindergarten' } },
  { kind: 'park', lat: 41.54283, lng: 60.60548, name: { uz: 'Park', ru: 'Парк', en: 'Park' } },
  { kind: 'school', lat: 41.54297, lng: 60.61186, name: { uz: '9-son maktab', ru: 'Школа №9', en: 'School No. 9' } },
  { kind: 'university', lat: 41.5355, lng: 60.60034, name: { uz: "Ma'mun universiteti", ru: 'Университет Мамуна', en: "Ma'mun University" } },
  { kind: 'university', lat: 41.55551, lng: 60.60525, name: { uz: 'Urganch davlat universiteti', ru: 'Ургенчский госуниверситет', en: 'Urgench State University' } },
  { kind: 'mosque', lat: 41.55415, lng: 60.60898, name: { uz: "Ko'zli ota jome masjidi", ru: 'Мечеть Кўзли ота', en: "Ko'zli ota mosque" } },
  { kind: 'park', lat: 41.55279, lng: 60.6131, name: { uz: "\"Yoshlar ko'li\" bog'i", ru: 'Парк «Ёшлар кўли»', en: '"Yoshlar ko\'li" park' } },
];

const ICON: Record<Kind, React.ElementType> = {
  school: School, hospital: HeartPulse, kindergarten: Baby, park: Trees, university: GraduationCap, mosque: Landmark,
};
const COLOR: Record<Kind, string> = {
  school: '#F2B98A', hospital: '#FF8A8A', kindergarten: '#FFD27A', park: '#7FD99A', university: '#8FC8FF', mosque: '#C9A7FF',
};

const toR = (x: number) => (x * Math.PI) / 180;
function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Ekvirektangulyar proyeksiya (1.5 km radiusda xato sezilmaydi): sharq = +x, shimol = −y.
// Radius kvadrat ildiz shkalasida — yaqin obyektlar markazga yopishib qolmaydi, yo'nalish aniq saqlanadi.
const scale = (d: number) => Math.sqrt(Math.min(d, RADIUS_M) / RADIUS_M) * 0.92;
function offset(p: { lat: number; lng: number }) {
  const dx = toR(p.lng - CENTER.lng) * 6371000 * Math.cos(toR(CENTER.lat));
  const dy = toR(p.lat - CENTER.lat) * 6371000;
  const d = Math.hypot(dx, dy) || 1;
  const r = scale(d);
  return { x: (dx / d) * r, y: (-dy / d) * r };
}

const T: Record<string, {
  kicker: string; title: string; sub: string; walk: string; min: string; km: string; m: string;
  office: string; address: string; hours: string; directions: string; yandex: string; openMap: string; call: string;
  rings: string[]; note: string;
}> = {
  uz: {
    kicker: 'Joylashuv', title: 'Hamma narsa bir qadam narida', sub: "Maktab, shifoxona, bog'cha va universitet — piyoda yetib boriladigan masofada.",
    walk: 'piyoda', min: 'daq', km: 'km', m: 'm', office: 'Sotuv ofisi', address: "Urganch sh., Ulug'bek ko'chasi — Ekstrenniy shifoxonasi chorrahasi",
    hours: 'Har kuni, 09:00 – 18:00', directions: "Yo'l ko'rsatish", yandex: "Yandex'da ochish", openMap: 'Interaktiv xarita', call: "Qo'ng'iroq qilish",
    rings: ['500 m', '1 km', '1,5 km'], note: "Masofalar sotuv ofisidan to'g'ri chiziq bo'yicha · OpenStreetMap",
  },
  ru: {
    kicker: 'Расположение', title: 'Всё в шаге от вас', sub: 'Школа, больница, детсад и университет — в пешей доступности.',
    walk: 'пешком', min: 'мин', km: 'км', m: 'м', office: 'Офис продаж', address: 'г. Ургенч, ул. Улугбека — перекрёсток у больницы экстренной помощи',
    hours: 'Ежедневно, 09:00 – 18:00', directions: 'Проложить маршрут', yandex: 'Открыть в Яндексе', openMap: 'Интерактивная карта', call: 'Позвонить',
    rings: ['500 м', '1 км', '1,5 км'], note: 'Расстояния от офиса продаж по прямой · OpenStreetMap',
  },
  en: {
    kicker: 'Location', title: 'Everything within reach', sub: 'School, hospital, kindergarten and university — all within walking distance.',
    walk: 'walk', min: 'min', km: 'km', m: 'm', office: 'Sales office', address: 'Urgench, Ulugbek street — Emergency Hospital crossroads',
    hours: 'Daily, 09:00 – 18:00', directions: 'Get directions', yandex: 'Open in Yandex', openMap: 'Interactive map', call: 'Call us',
    rings: ['500 m', '1 km', '1.5 km'], note: 'Straight-line distances from the sales office · OpenStreetMap',
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LocationShowcase({ lang, phone, address, hours }: { lang: string; phone?: string; address?: string; hours?: string }) {
  const t = T[lang] || T.uz;
  const [active, setActive] = useState<number | null>(0);
  const [showMap, setShowMap] = useState(false);

  const places = PLACES.map((p) => ({ ...p, d: distanceM(CENTER, p), pos: offset(p) })).sort((a, b) => a.d - b.d);
  const fmt = (d: number) => (d < 1000 ? `${Math.round(d / 10) * 10} ${t.m}` : `${(d / 1000).toFixed(1).replace('.', lang === 'en' ? '.' : ',')} ${t.km}`);
  const walkMin = (d: number) => Math.max(1, Math.round(d / 80)); // ~4.8 km/soat

  const phoneVal = phone || '+998 91 011 66 66';
  const telHref = 'tel:' + phoneVal.replace(/[^\d+]/g, '');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CENTER.lat},${CENTER.lng}`;
  const yandexUrl = `https://yandex.uz/maps/?pt=${CENTER.lng},${CENTER.lat}&z=16&l=map`;
  const sel = active != null ? places[active] : null;

  return (
    <section id="location" className="relative overflow-hidden bg-[#011f1f] text-white py-24 md:py-32 px-6" data-cine-skip>
      <div className="absolute inset-0 bg-grid opacity-[0.12] pointer-events-none" />
      <div className="relative max-container">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center">
          {/* Chap: matn + ro'yxat */}
          <div>
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.7em' }} whileInView={{ opacity: 1, letterSpacing: '0.32em' }} viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              className="flex items-center gap-3 text-accent text-[10px] md:text-xs uppercase font-bold mb-5"
            >
              <span className="h-px w-10 bg-accent/70" />{t.kicker}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}
              className="font-montserrat font-extrabold text-[clamp(2.1rem,5vw,4.2rem)] leading-[1.02] tracking-[-0.03em]"
            >
              {t.title}
            </motion.h2>
            <p className="mt-5 text-white/70 text-base md:text-lg max-w-lg leading-relaxed">{t.sub}</p>

            <ul className="mt-9 grid sm:grid-cols-2 gap-2.5">
              {places.slice(0, 8).map((p, i) => {
                const Icon = ICON[p.kind];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      className={`w-full flex items-center gap-3 text-left p-3 rounded-2xl border transition-colors duration-300 ${active === i ? 'bg-white/10 border-accent/50' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'}`}
                    >
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${COLOR[p.kind]}22`, color: COLOR[p.kind] }}>
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-sm truncate">{p.name[lang] || p.name.uz}</span>
                        <span className="block text-xs text-white/55">
                          <span className="text-accent font-bold">{fmt(p.d)}</span> · {walkMin(p.d)} {t.min} {t.walk}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* O'ng: radar-xarita */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.1, ease: EASE }}
            className="relative"
          >
            <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-full">
              {/* Halqalar */}
              {[500, 1000, 1500].map((m, idx) => (
                <div key={m} className="absolute rounded-full border border-white/25 bg-white/[0.015]" style={{ inset: `${50 - scale(m) * 50}%` }}>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 text-[10px] font-bold text-white/60 bg-[#011f1f] tracking-wider">{t.rings[idx]}</span>
                </div>
              ))}
              {/* Aylanuvchi radar nuri */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 animate-[spin_9s_linear_infinite] [background:conic-gradient(from_0deg,rgba(209,142,91,0.28),transparent_22%)]" />
              </div>
              <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(1,66,66,0.6),transparent_70%)] pointer-events-none" />
              {/* Shimol */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-7 text-[10px] font-bold tracking-[0.3em] text-accent">N</div>

              {/* Obyektlar */}
              {places.map((p, i) => {
                const Icon = ICON[p.kind];
                const isActive = active === i;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-label={`${p.name[lang] || p.name.uz} — ${fmt(p.d)}`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (p.d / RADIUS_M) * 0.9, duration: 0.6, ease: EASE }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${50 + p.pos.x * 50}%`, top: `${50 + p.pos.y * 50}%` }}
                  >
                    <span
                      className={`flex items-center justify-center rounded-full border-2 transition-transform duration-300 ${isActive ? 'scale-125' : 'hover:scale-110'}`}
                      style={{ width: 34, height: 34, background: '#012f2f', borderColor: COLOR[p.kind], color: COLOR[p.kind], boxShadow: isActive ? `0 0 0 6px ${COLOR[p.kind]}33, 0 0 24px ${COLOR[p.kind]}88` : 'none' }}
                    >
                      <Icon size={16} />
                    </span>
                  </motion.button>
                );
              })}

              {/* Markaz — ofis */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
                <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-accent text-primary shadow-[0_0_40px_rgba(209,142,91,0.7)]">
                  <MapPin size={22} />
                </span>
              </div>

              {/* Tanlangan obyekt yorlig'i */}
              {sel && (
                <div
                  className="absolute z-30 pointer-events-none -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${50 + sel.pos.x * 50}%`, top: `calc(${50 + sel.pos.y * 50}% + 24px)` }}
                >
                  <div className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-white text-primary shadow-2xl text-center">
                    <div className="text-xs font-extrabold">{sel.name[lang] || sel.name.uz}</div>
                    <div className="text-[11px] font-bold text-accent">{fmt(sel.d)} · {walkMin(sel.d)} {t.min} {t.walk}</div>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-6 text-center text-[11px] text-white/40">{t.note}</p>
          </motion.div>
        </div>

        {/* Ofis + harakatlar */}
        <div className="mt-14 grid md:grid-cols-[1.4fr_1fr] gap-4">
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6 md:p-7 flex flex-col sm:flex-row gap-5 sm:items-center">
            <span className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0"><MapPin size={26} /></span>
            <div className="flex-1 min-w-0">
              <div className="text-accent text-[11px] uppercase tracking-[0.25em] font-bold">{t.office}</div>
              <div className="mt-1 font-bold text-lg leading-snug">{address || t.address}</div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/65">
                <a href={telHref} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"><Phone size={14} />{phoneVal}</a>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} />{hours || t.hours}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-accent text-primary font-bold py-4 hover:bg-white transition-colors">
              <Navigation size={18} />{t.directions}
            </a>
            <a href={yandexUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 text-white font-bold py-3.5 text-sm hover:bg-white hover:text-primary transition-colors">
              {t.yandex}
            </a>
            <button type="button" onClick={() => setShowMap((v) => !v)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 text-white font-bold py-3.5 text-sm hover:bg-white hover:text-primary transition-colors">
              <MapIcon size={16} />{t.openMap}
            </button>
          </div>
        </div>

        {/* Og'ir Google xarita — faqat so'ralganda */}
        {showMap && (
          <div className="mt-4 rounded-3xl overflow-hidden border border-white/10 h-[380px] md:h-[440px] bg-[#0b2a2a]">
            <iframe
              src={`https://maps.google.com/maps?q=${CENTER.lat},${CENTER.lng}&z=15&output=embed`}
              title="Voha Residence — Urganch"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
}
