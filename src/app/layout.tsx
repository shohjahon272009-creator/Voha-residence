 
 
 
 
 
import type { Metadata } from "next";
import { Inter, Montserrat, Bebas_Neue, Oswald } from 'next/font/google';
import "./globals.css";
import db from '@/lib/db';
import { headers } from 'next/headers';

// Kirill (ru) harflari ham yuklansin — aks holda rus sahifasi tizim shriftida chiqardi
const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat' });
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
// Bebas'da kirill yo'q — rus harflari uchun unga o'xshash Oswald (font-bebas zaxirasi)
const oswald = Oswald({ weight: ['500'], subsets: ['cyrillic'], variable: '--font-oswald' });

// The whole app is backed by SQLite (a native module). Static prerendering runs it
// inside Turbopack worker processes that crash ("Jest worker ... child process
// exceptions"). Forcing dynamic rendering app-wide keeps every route in the main
// server process where better-sqlite3 works.
export const dynamic = 'force-dynamic';

// SEO sarlavha/tavsif admin sozlamalaridan (Meta Title / Meta Description) olinadi
export async function generateMetadata(): Promise<Metadata> {
  let title = "Voha Residence — Xorazmda yangi xonadonlar va turar-joy majmualari";
  let description = "Xorazm va Urganch shahridagi zamonaviy turar-joy majmualari. Yangi xonadonlar, qulay muddatli to‘lov va ipoteka. Sifatli qurilish, o‘z vaqtida topshirish.";
  try {
    const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('meta_title_uz', 'meta_description')").all() as { key: string, value: string }[];
    const s = rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);
    if (s.meta_title_uz) title = s.meta_title_uz;
    if (s.meta_description) description = s.meta_description;
  } catch {
    // sozlama o'qilmasa — standart matn
  }
  return {
    // Barcha metadata URL'lari (favicon, Open Graph) asosiy domenga bog'lanadi —
    // avval www/www'siz nomuvofiqligi favicon ko'rinmasligiga sabab bo'lardi.
    metadataBase: new URL('https://www.voharesidence.uz'),
    title,
    description,
    keywords: ['Voha Residence', 'Xorazm xonadonlar', 'Urganch turar-joy', 'yangi uylar Xorazm', 'kvartira Xorazm', 'muddatli to‘lov', 'ipoteka Xorazm', 'turar-joy majmuasi', 'novostroyka Xorazm'],
    // Canonical + hreflang endi har sahifaning o'zida (src/lib/seo.ts) — bu yerda
    // canonical '/' hamma ichki sahifani bosh sahifaning nusxasi qilib ko'rsatardi.
    // Favicon: asosiy — vektorli SVG (haqiqiy Voha logotipi, har o'lchamda tiniq),
    // zaxira — JPEG. Nisbiy havolalar, cross-domen (www) muammosi yo'q.
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon.jpg' }],
      shortcut: '/icon.svg',
      apple: '/icon.jpg',
    },
    openGraph: { title, description, type: 'website', url: 'https://www.voharesidence.uz', images: [{ url: '/cinema/poster.jpg', width: 1920, height: 1080 }], siteName: 'Voha Residence' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts URL'dan aniqlagan til (/ru/... -> ru); admin va boshqa yo'llarda — uz
  const lang = (await headers()).get('x-lang') || 'uz';
  let primaryColor = '#014242';
  let accentColor = '#D18E5B';
  let s: Record<string, string> = {};

  try {
    const settingsRows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('primary_color', 'accent_color', 'contact_phone', 'contact_address', 'office_lat', 'office_lng')").all() as { key: string, value: string }[];
    s = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
    // Faqat haqiqiy HEX rang — <style> ichiga xom matn tushib, skript kiritilishining oldini oladi
    const HEX = /^#[0-9a-fA-F]{3,8}$/;
    if (s.primary_color && HEX.test(s.primary_color)) primaryColor = s.primary_color;
    if (s.accent_color && HEX.test(s.accent_color)) accentColor = s.accent_color;
  } catch {
    // sozlamalar o'qilmasa, standart ranglar ishlatiladi
  }

  // Struktura ma'lumot (JSON-LD) — Google biznesni to'liq tushunadi (mahalliy qidiruv uchun muhim)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Voha Residence',
    url: 'https://www.voharesidence.uz',
    logo: 'https://www.voharesidence.uz/icon.jpg',
    image: 'https://www.voharesidence.uz/icon.jpg',
    telephone: (s.contact_phone || '+998 91 011 66 66').replace(/\s/g, ''),
    description: 'Xorazm va Urganch shahridagi zamonaviy turar-joy majmualari — yangi xonadonlar, qulay to‘lov va ipoteka.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.contact_address || 'Ulug‘bek ko‘chasi',
      addressLocality: 'Urganch',
      addressRegion: 'Xorazm',
      addressCountry: 'UZ',
    },
    ...(s.office_lat && s.office_lng ? { geo: { '@type': 'GeoCoordinates', latitude: s.office_lat, longitude: s.office_lng } } : {}),
    areaServed: 'Xorazm',
    sameAs: ['https://www.instagram.com/voha_residence', 'https://t.me/voharesidence'],
  };

  return (
    <html lang={lang} className={`${inter.variable} ${montserrat.variable} ${bebas.variable} ${oswald.variable}`}>
       <head>
          {/* Speed up the Google Maps embed by warming up its connections early */}
          <link rel="preconnect" href="https://maps.google.com" />
          <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://khms0.googleapis.com" />
          <link rel="preconnect" href="https://khms1.googleapis.com" />
          <link rel="dns-prefetch" href="https://maps.googleapis.com" />
          <style dangerouslySetInnerHTML={{ __html: `:root { --color-primary: ${primaryColor}; --color-accent: ${accentColor}; }` }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
       </head>
       <body className="antialiased font-inter">
        {children}
      </body>
    </html>
  );
}
