'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone, Clock, Map as MapIcon, School, HeartPulse, Baby, Trees, GraduationCap, Landmark, Footprints, Pointer } from 'lucide-react';

/*
  Lokatsiya — "Hamma narsa bir qadam narida".
  Markaz: sotuv ofisi (Ekstrenniy shifoxonasi chorrahasi). Atrofdagi obyektlar va masofalar —
  OpenStreetMap ma'lumotlari (2026-10), to'g'ri chiziq bo'yicha hisoblangan; noto'g'ri belgilangan
  obyektlar (masalan, "bog'cha" deb yozilgan to'yxona) chiqarib tashlangan.
  Har yoshdagi odam tushunsin: haqiqiy ko'cha xaritasi (OpenStreetMap plitkalari),
  har bir joy — rangli belgi + raqam, ro'yxatda o'sha raqam va "🚶 N daqiqa piyoda".
  Xarita statik plitkalardan — kutubxonasiz, tez; og'ir Google xarita faqat tugma bosilganda.
*/

type Kind = 'school' | 'hospital' | 'kindergarten' | 'park' | 'university' | 'mosque';
type Place = { kind: Kind; lat: number; lng: number; name: Record<string, string> };

const CENTER = { lat: 41.544716, lng: 60.599816 };

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

const ICON: Record<Kind, React.ElementType> = { school: School, hospital: HeartPulse, kindergarten: Baby, park: Trees, university: GraduationCap, mosque: Landmark };
const COLOR: Record<Kind, string> = { school: '#E07B39', hospital: '#E04848', kindergarten: '#D9A21B', park: '#2E9E5B', university: '#2F6FD6', mosque: '#7A4FD0' };
const KIND: Record<Kind, Record<string, string>> = {
  school: { uz: 'Maktab', ru: 'Школа', en: 'School' },
  hospital: { uz: 'Shifoxona', ru: 'Больница', en: 'Hospital' },
  kindergarten: { uz: "Bog'cha", ru: 'Детсад', en: 'Kindergarten' },
  park: { uz: 'Park', ru: 'Парк', en: 'Park' },
  university: { uz: 'Universitet', ru: 'Университет', en: 'University' },
  mosque: { uz: 'Masjid', ru: 'Мечеть', en: 'Mosque' },
};

const toR = (x: number) => (x * Math.PI) / 180;
function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Web Mercator: z=15 da ofis atrofidagi VIEW×VIEW piksellik oyna (~±1,45 km). Hammasi foizda — har ekranga moslashadi.
const Z = 15;
const VIEW = 820;
const TILE = 256;
const worldX = (lng: number) => ((lng + 180) / 360) * TILE * 2 ** Z;
const worldY = (lat: number) => ((1 - Math.log(Math.tan(toR(lat)) + 1 / Math.cos(toR(lat))) / Math.PI) / 2) * TILE * 2 ** Z;
const X0 = worldX(CENTER.lng) - VIEW / 2;
const Y0 = worldY(CENTER.lat) - VIEW / 2;
const pct = (v: number) => `${(v / VIEW) * 100}%`;
const pos = (p: { lat: number; lng: number }) => ({ left: pct(worldX(p.lng) - X0), top: pct(worldY(p.lat) - Y0) });
const TILES: { x: number; y: number }[] = [];
for (let tx = Math.floor(X0 / TILE); tx <= Math.floor((X0 + VIEW) / TILE); tx++)
  for (let ty = Math.floor(Y0 / TILE); ty <= Math.floor((Y0 + VIEW) / TILE); ty++) TILES.push({ x: tx, y: ty });
// 1 km doira radiusi (piksel): z=15 da metr/piksel = 156543·cos(lat)/2^z
const M_PER_PX = (156543.03 * Math.cos(toR(CENTER.lat))) / 2 ** Z;
const KM_RING = 1000 / M_PER_PX;

const T: Record<string, {
  kicker: string; title: string; sub: string; walk: string; min: string; km: string; m: string; hint: string; ring: string;
  office: string; address: string; hours: string; directions: string; yandex: string; openMap: string;
}> = {
  uz: {
    kicker: 'Joylashuv', title: 'Hamma narsa bir qadam narida', sub: "Maktab, shifoxona, bog'cha, park va masjid — barchasi piyoda yetib boriladigan masofada.",
    walk: 'piyoda', min: 'daqiqa', km: 'km', m: 'm', hint: "Ro'yxatdagi joyni bosing — xaritada ko'rsatiladi", ring: '1 km ≈ 12 daqiqa piyoda',
    office: 'Sotuv ofisi', address: "Urganch sh., Ulug'bek ko'chasi — Ekstrenniy shifoxonasi chorrahasi",
    hours: 'Har kuni, 09:00 – 18:00', directions: "Yo'l ko'rsatish", yandex: "Yandex'da ochish", openMap: 'Google xarita',
  },
  ru: {
    kicker: 'Расположение', title: 'Всё в шаге от вас', sub: 'Школа, больница, детсад, парк и мечеть — всё в пешей доступности.',
    walk: 'пешком', min: 'мин', km: 'км', m: 'м', hint: 'Нажмите на место в списке — оно покажется на карте', ring: '1 км ≈ 12 минут пешком',
    office: 'Офис продаж', address: 'г. Ургенч, ул. Улугбека — перекрёсток у больницы экстренной помощи',
    hours: 'Ежедневно, 09:00 – 18:00', directions: 'Проложить маршрут', yandex: 'Открыть в Яндексе', openMap: 'Google карта',
  },
  en: {
    kicker: 'Location', title: 'Everything within reach', sub: 'School, hospital, kindergarten, park and mosque — all within walking distance.',
    walk: 'walk', min: 'min', km: 'km', m: 'm', hint: 'Tap a place in the list to see it on the map', ring: '1 km ≈ 12 min walk',
    office: 'Sales office', address: 'Urgench, Ulugbek street — Emergency Hospital crossroads',
    hours: 'Daily, 09:00 – 18:00', directions: 'Get directions', yandex: 'Open in Yandex', openMap: 'Google map',
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LocationShowcase({ lang, phone, address, hours }: { lang: string; phone?: string; address?: string; hours?: string }) {
  const t = T[lang] || T.uz;
  const [active, setActive] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const places = PLACES.map((p) => ({ ...p, d: distanceM(CENTER, p) })).sort((a, b) => a.d - b.d);
  const fmt = (d: number) => (d < 1000 ? `${Math.round(d / 10) * 10} ${t.m}` : `${(d / 1000).toFixed(1).replace('.', lang === 'en' ? '.' : ',')} ${t.km}`);
  const walkMin = (d: number) => Math.max(1, Math.round(d / 80)); // ~4.8 km/soat
  const name = (p: Place) => p.name[lang] || p.name.uz;

  const phoneVal = phone || '+998 91 011 66 66';
  const telHref = 'tel:' + phoneVal.replace(/[^\d+]/g, '');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CENTER.lat},${CENTER.lng}`;
  const yandexUrl = `https://yandex.uz/maps/?pt=${CENTER.lng},${CENTER.lat}&z=16&l=map`;
  const sel = places[active];
  const center = pos(CENTER);

  return (
    <section id="location" className="relative overflow-hidden bg-[#011f1f] text-white py-24 md:py-32 px-6" data-cine-skip>
      <div className="absolute inset-0 bg-grid opacity-[0.12] pointer-events-none" />
      <div className="relative max-container">
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
        <p className="mt-5 text-white/75 text-base md:text-lg max-w-2xl leading-relaxed">{t.sub}</p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 lg:gap-8 items-start">
          {/* Ro'yxat: raqam + emoji + nomi + necha daqiqa */}
          <div className="order-2 lg:order-1 min-w-0">
            <p className="mb-3 flex items-center gap-2 text-sm text-white/55"><Pointer size={15} />{t.hint}</p>
            <ul className="grid grid-cols-1 gap-2.5">
              {places.map((p, i) => { const Icon = ICON[p.kind]; return (
                <li key={i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`w-full flex items-center gap-4 text-left px-4 py-3 rounded-2xl border transition-colors duration-300 ${active === i ? 'bg-white text-primary border-white' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black ${active === i ? 'bg-accent text-primary' : 'bg-white/10 text-white'}`}>{i + 1}</span>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: COLOR[p.kind] }} aria-hidden><Icon size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-[15px] leading-tight truncate">{name(p)}</span>
                      <span className={`block text-xs mt-0.5 ${active === i ? 'text-primary/60' : 'text-white/50'}`}>{KIND[p.kind][lang] || KIND[p.kind].uz} · {fmt(p.d)}</span>
                    </span>
                    <span className={`shrink-0 text-right font-extrabold leading-tight ${active === i ? 'text-accent' : 'text-white'}`}>
                      <span className="flex items-center justify-end gap-1 text-sm"><Footprints size={14} />{walkMin(p.d)} {t.min}</span>
                      <span className={`block text-[11px] font-semibold ${active === i ? 'text-primary/50' : 'text-white/45'}`}>{t.walk}</span>
                    </span>
                  </button>
                </li>
              ); })}
            </ul>
          </div>

          {/* Haqiqiy ko'cha xaritasi */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: EASE }}
            className="order-1 lg:order-2 lg:sticky lg:top-28 min-w-0"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-white/15 bg-[#e9e5dc] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              {TILES.map(({ x, y }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${x}-${y}`}
                  src={`https://tile.openstreetmap.org/${Z}/${x}/${y}.png`}
                  alt="" loading="lazy" decoding="async" draggable={false}
                  className="absolute max-w-none select-none"
                  style={{ left: pct(x * TILE - X0), top: pct(y * TILE - Y0), width: pct(TILE), height: pct(TILE) }}
                />
              ))}

              {/* 1 km doira */}
              <div
                className="absolute rounded-full border-2 border-dashed border-primary/45 bg-primary/[0.05] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: center.left, top: center.top, width: pct(KM_RING * 2), height: pct(KM_RING * 2) }}
              >
                <span className="absolute left-1/2 -translate-x-1/2 -top-3.5 whitespace-nowrap rounded-full bg-primary text-white text-[10px] md:text-xs font-bold px-2.5 py-1 shadow">{t.ring}</span>
              </div>

              {/* Tanlangan joygacha chiziq */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${VIEW} ${VIEW}`} preserveAspectRatio="none">
                <line
                  x1={worldX(CENTER.lng) - X0} y1={worldY(CENTER.lat) - Y0}
                  x2={worldX(sel.lng) - X0} y2={worldY(sel.lat) - Y0}
                  stroke="#D18E5B" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round"
                />
              </svg>

              {/* Joylar */}
              {places.map((p, i) => {
                const on = active === i;
                const Icon = ICON[p.kind];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-label={`${name(p)} — ${walkMin(p.d)} ${t.min} ${t.walk}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${on ? 'z-30 scale-110' : 'z-10 hover:z-20 hover:scale-110'}`}
                    style={pos(p)}
                  >
                    <span className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-[3px] border-white shadow-lg text-white" style={{ background: COLOR[p.kind], boxShadow: on ? `0 0 0 5px ${COLOR[p.kind]}55, 0 6px 16px rgba(0,0,0,.35)` : undefined }}>
                      <Icon size={17} />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center border-2 border-white">{i + 1}</span>
                    </span>
                  </button>
                );
              })}

              {/* Tanlangan joy yorlig'i */}
              <div
                className="absolute z-40 pointer-events-none -translate-x-1/2 transition-all duration-300"
                style={{ left: `clamp(22%, ${pos(sel).left}, 78%)`, top: `clamp(4%, calc(${pos(sel).top} - 92px), 84%)` }}
              >
                <div className="whitespace-nowrap px-4 py-2.5 rounded-2xl bg-primary text-white shadow-2xl text-center border border-white/20">
                  <div className="text-sm font-extrabold">{name(sel)}</div>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-accent mt-0.5"><Footprints size={12} />{walkMin(sel.d)} {t.min} {t.walk} · {fmt(sel.d)}</div>
                </div>
              </div>

              {/* Ofis */}
              <div className="absolute z-[5] -translate-x-1/2 -translate-y-2 pointer-events-none" style={center}>
                <div className="flex flex-col items-center">
                  <span className="relative w-4 h-4 rounded-full bg-accent border-[3px] border-white shadow">
                    <span className="absolute inset-0 rounded-full bg-accent/60 animate-ping" />
                  </span>
                  <span className="mt-0.5 w-0 h-0 border-x-[7px] border-x-transparent border-b-[8px] border-b-accent" />
                  <div className="whitespace-nowrap rounded-xl bg-accent text-primary px-3 py-1.5 text-xs md:text-sm font-extrabold shadow-xl flex items-center gap-1"><MapPin size={14} />{t.office}</div>
                </div>
              </div>

              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-3 z-10 text-[10px] text-black/70 bg-white/80 rounded px-1.5 hover:underline">© OpenStreetMap contributors</a>
            </div>
          </motion.div>
        </div>

        {/* Ofis + harakatlar */}
        <div className="mt-14 grid md:grid-cols-[1.4fr_1fr] gap-4">
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6 md:p-7 flex flex-col sm:flex-row gap-5 sm:items-center">
            <span className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0"><MapPin size={26} /></span>
            <div className="flex-1 min-w-0">
              <div className="text-accent text-[11px] uppercase tracking-[0.25em] font-bold">{t.office}</div>
              <div className="mt-1 font-bold text-lg leading-snug">{(lang === 'uz' && address) || t.address}</div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/65">
                <a href={telHref} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"><Phone size={14} />{phoneVal}</a>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} />{(lang === 'uz' && hours) || t.hours}</span>
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
