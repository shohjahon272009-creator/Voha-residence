'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { MapPin, Phone, Clock, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalesOfficesSection({ lang }: { lang: Locale }) {
  const dict = {
    uz: {
      tag: "JOYLASHUV",
      title: "Bizning sotuv ofisimiz",
      subtitle: "Mutaxassislarimiz sizni kutib oladi va barcha savollaringizga javob beradi.",
      badge: "Asosiy ofis",
      officeName: "Voha Residence Sotuv Ofisi",
      address: "Xorazm viloyati, Urganch sh., Ulug'bek ko'chasi",
      phoneLabel: "Telefon",
      hoursLabel: "Ish vaqti",
      hours: "Har kuni, 09:00 – 18:00",
      directions: "Yo'l ko'rsatish",
      loading: "Xarita yuklanmoqda…",
      onMap: "Xaritada",
    },
    ru: {
      tag: "РАСПОЛОЖЕНИЕ",
      title: "Наш офис продаж",
      subtitle: "Наши специалисты встретят вас и ответят на все вопросы.",
      badge: "Главный офис",
      officeName: "Офис продаж Voha Residence",
      address: "Хорезмская область, г. Ургенч, ул. Улугбека",
      phoneLabel: "Телефон",
      hoursLabel: "Время работы",
      hours: "Ежедневно, 09:00 – 18:00",
      directions: "Построить маршрут",
      loading: "Загрузка карты…",
      onMap: "На карте",
    },
    en: {
      tag: "LOCATION",
      title: "Our Sales Office",
      subtitle: "Our specialists will welcome you and answer all your questions.",
      badge: "Head office",
      officeName: "Voha Residence Sales Office",
      address: "Khorezm region, Urgench, Ulugbek street",
      phoneLabel: "Phone",
      hoursLabel: "Working hours",
      hours: "Every day, 09:00 – 18:00",
      directions: "Get directions",
      loading: "Loading map…",
      onMap: "On the map",
    }
  }[lang] || {
      tag: "JOYLASHUV",
      title: "Bizning sotuv ofisimiz",
      subtitle: "Mutaxassislarimiz sizni kutib oladi va barcha savollaringizga javob beradi.",
      badge: "Asosiy ofis",
      officeName: "Voha Residence Sotuv Ofisi",
      address: "Xorazm viloyati, Urganch sh., Ulug'bek ko'chasi",
      phoneLabel: "Telefon",
      hoursLabel: "Ish vaqti",
      hours: "Har kuni, 09:00 – 18:00",
      directions: "Yo'l ko'rsatish",
      loading: "Xarita yuklanmoqda…",
      onMap: "Xaritada",
  };

  // Sotuv ofisining aniq koordinatasi (Urganch, Ulug'bek ko'chasi).
  // Yandex org 8272760691 dagi haqiqiy nuqta (ll — xarita markazi emas, org o'zi).
  const OFFICE_LAT = 41.544682;
  const OFFICE_LNG = 60.599698;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LAT},${OFFICE_LNG}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${OFFICE_LAT},${OFFICE_LNG}&z=16&output=embed`;

  // Lazy-mount the heavy Google Maps iframe only when the section approaches the viewport.
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // start loading a bit before it's visible
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 bg-[#FDFBF7] relative overflow-hidden">
      {/* Soft decorative accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-radial-glow pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-container relative z-10">
        <div className="mb-12 flex flex-col items-center md:items-start">
          <span className="eyebrow mb-5">{dict.tag}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center md:text-left">
            {dict.title}
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl text-center md:text-left text-base md:text-lg leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left: Office details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full lg:w-2/5 flex flex-col gap-5"
          >
            {/* Featured office card */}
            <div className="group relative overflow-hidden bg-primary text-white p-8 rounded-3xl shadow-[0_18px_50px_rgba(1,66,66,0.35)] border border-white/5 flex-1">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/15 rounded-full blur-3xl group-hover:bg-accent/25 transition-colors duration-500" />
              <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />

              <div className="relative z-10 flex flex-col h-full">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-widest mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {dict.badge}
                </span>

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:scale-105 transition-all">
                    <MapPin className="w-7 h-7 text-accent group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl leading-tight mb-1.5">{dict.officeName}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{dict.address}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="mt-auto space-y-3">
                  <a href="tel:+998910116666" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-white/40 font-bold">{dict.phoneLabel}</div>
                      <div className="font-bold text-white tracking-wide">+998 91 011 66 66</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-white/40 font-bold">{dict.hoursLabel}</div>
                      <div className="font-bold text-white">{dict.hours}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions CTA */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full py-5 rounded-3xl bg-gradient-to-r from-accent to-[#c47e4d] text-white font-bold shadow-lg shadow-accent/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 transition-all"
            >
              <Navigation className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {dict.directions}
            </a>
          </motion.div>

          {/* Right: Map (lazy-loaded with a premium skeleton) */}
          <motion.div
            ref={mapRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full lg:w-3/5 min-h-[420px] lg:min-h-0 rounded-[28px] p-[2px] bg-gradient-to-br from-accent/40 via-white to-primary/20 shadow-2xl relative"
          >
            <div className="relative w-full h-full min-h-[416px] rounded-[26px] overflow-hidden bg-[#e9e5dd]">
              {/* Skeleton (shown until the iframe reports loaded) */}
              {!mapLoaded && (
                <div className="absolute inset-0 z-20 shimmer flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                    <div className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <MapPin className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary/70 font-bold text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {dict.loading}
                  </div>
                </div>
              )}

              {/* Heavy embed mounts only once the section is near the viewport */}
              {showMap && (
                <iframe
                  src={mapEmbedUrl}
                  title="Voha Residence — Urganch"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '416px' }}
                  className={`w-full h-full transition-opacity duration-700 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                ></iframe>
              )}

              {/* Floating glass pin card over the map */}
              <div className={`absolute left-4 bottom-4 z-30 transition-all duration-700 ${mapLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                <div className="flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-white/60">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] uppercase tracking-widest text-accent font-bold">{dict.onMap}</div>
                    <div className="text-sm font-bold text-primary">{dict.officeName}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
