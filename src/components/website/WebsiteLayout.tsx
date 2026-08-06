 
 
 
 
import React from 'react';
import Link from 'next/link';
import Navbar from '../common/Navbar';
import VohaLogo from '@/components/common/VohaLogo';
import IntroScreen from './IntroScreen';
import { Locale } from '@/lib/dictionaries';

export default function WebsiteLayout({
  children,
  lang,
  companyName = 'Voha Residence'
}: {
  children: React.ReactNode;
  lang: Locale;
  companyName?: string;
}) {

  const t = {
    uz: {
      desc: "O'zbekistondagi eng yaxshi qurilish loyihalari. Sifat, ishonch va zamonaviy yechimlar.",
      sections: "Bo'limlar",
      project: "Loyiha",
      about: "Biz haqimizda",
      apartments: "Xonadonlar",
      news: "Yangiliklar",
      contact: "Aloqa",
      address: "Xorazm viloyati, Urganch shahri",
      rights: `© ${new Date().getFullYear()} ${companyName}. Barcha huquqlar himoyalangan.`,
      links: "Foydali havolalar"
    },
    ru: {
      desc: "Лучшие строительные проекты в Узбекистане. Качество, доверие и современные решения.",
      sections: "Разделы",
      project: "Проект",
      about: "О нас",
      apartments: "Квартиры",
      news: "Новости",
      contact: "Контакты",
      address: "Хорезмская область, г. Ургенч",
      rights: `© ${new Date().getFullYear()} ${companyName}. Все права защищены.`,
      links: "Полезные ссылки"
    },
    en: {
      desc: "The best construction projects in Uzbekistan. Quality, trust and modern solutions.",
      sections: "Sections",
      project: "Project",
      about: "About Us",
      apartments: "Apartments",
      news: "News",
      contact: "Contact",
      address: "Khorezm region, Urgench city",
      rights: `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`,
      links: "Useful Links"
    }
  }[lang] || {
      desc: "O'zbekistondagi eng yaxshi qurilish loyihalari. Sifat, ishonch va zamonaviy yechimlar.",
      sections: "Bo'limlar",
      project: "Loyiha",
      about: "Biz haqimizda",
      apartments: "Xonadonlar",
      news: "Yangiliklar",
      contact: "Aloqa",
      address: "Xorazm viloyati, Urganch shahri",
      rights: `© ${new Date().getFullYear()} ${companyName}. Barcha huquqlar himoyalangan.`,
      links: "Foydali havolalar"
  };

  return (
    <div className="min-h-screen">
      <IntroScreen />
      <Navbar lang={lang} />
      <main>{children}</main>
      <footer id="contact" className="bg-primary text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px rule-accent" />
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="max-container grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 text-accent">
              <VohaLogo className="h-12 w-auto" isScrolled={false} />
            </div>
            <p className="text-white/60 max-w-sm mb-6">
              {t.desc}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/voha_residence?igsh=MTdha2VieThkazh5dA==" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://t.me/voharesidence" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.4 4.02-2.76-.864c-.6-.188-.614-.6.126-.89l10.796-4.162c.5-.19.95.122.808.995z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t.sections}</h4>
            <ul className="space-y-4 text-white/60">
              <li><Link href={`/${lang}#projects`} className="hover:text-white transition-colors">{t.project}</Link></li>
              <li><Link href={`/${lang}#about`} className="hover:text-white transition-colors">{t.about}</Link></li>
              <li><Link href={`/${lang}#news`} className="hover:text-white transition-colors">{t.news}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t.contact}</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li>{t.address}</li>
              <li>+998 91 011 66 66</li>
              <li>+998 97 321 66 66</li>
            </ul>
          </div>
        </div>
        <div className="max-container mt-20 pt-10 border-t border-white/10 text-center text-white/40 text-sm">
           {t.rights}
        </div>
      </footer>

      {/* Floating Call Button */}
      <a 
        href="tel:+998910116666" 
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.7)] transition-all animate-bounce"
        aria-label="Call Us"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
      </a>
    </div>
  );
}
