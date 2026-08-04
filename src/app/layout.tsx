 
 
 
 
 
import type { Metadata } from "next";
import { Inter, Montserrat, Bebas_Neue } from 'next/font/google';
import "./globals.css";
import db from '@/lib/db';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });

// The whole app is backed by SQLite (a native module). Static prerendering runs it
// inside Turbopack worker processes that crash ("Jest worker ... child process
// exceptions"). Forcing dynamic rendering app-wide keeps every route in the main
// server process where better-sqlite3 works.
export const dynamic = 'force-dynamic';

// SEO sarlavha/tavsif admin sozlamalaridan (Meta Title / Meta Description) olinadi
export async function generateMetadata(): Promise<Metadata> {
  let title = "Qurilish kompaniya - Xorazmdagi yangi xonadonlar";
  let description = "Xorazm va Urganch shahridagi eng zamonaviy turar-joy majmualari.";
  try {
    const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('meta_title_uz', 'meta_description')").all() as { key: string, value: string }[];
    const s = rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);
    if (s.meta_title_uz) title = s.meta_title_uz;
    if (s.meta_description) description = s.meta_description;
  } catch {
    // sozlama o'qilmasa — standart matn
  }
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: ['/icon.jpg'] },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let primaryColor = '#014242';
  let accentColor = '#D18E5B';

  try {
    const settingsRows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('primary_color', 'accent_color')").all() as { key: string, value: string }[];
    const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
    if (settings.primary_color) primaryColor = settings.primary_color;
    if (settings.accent_color) accentColor = settings.accent_color;
  } catch {
    // sozlamalar o'qilmasa, standart ranglar ishlatiladi
  }

  return (
    <html lang="uz" className={`${inter.variable} ${montserrat.variable} ${bebas.variable}`}>
       <head>
          {/* Speed up the Google Maps embed by warming up its connections early */}
          <link rel="preconnect" href="https://maps.google.com" />
          <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://khms0.googleapis.com" />
          <link rel="preconnect" href="https://khms1.googleapis.com" />
          <link rel="dns-prefetch" href="https://maps.googleapis.com" />
          <style dangerouslySetInnerHTML={{ __html: `:root { --color-primary: ${primaryColor}; --color-accent: ${accentColor}; }` }} />
       </head>
       <body className="antialiased font-inter">
        {children}
      </body>
    </html>
  );
}
