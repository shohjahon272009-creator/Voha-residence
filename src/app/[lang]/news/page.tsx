 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { Newspaper } from 'lucide-react';
import db from '@/lib/db';

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;
  const dict = getDictionary(localeLang);

  const t = {
    uz: { title: "Barcha Yangiliklar", empty: "Hozircha yangiliklar yo'q." },
    ru: { title: "Все новости", empty: "Пока нет новостей." },
    en: { title: "All News", empty: "No news yet." }
  }[localeLang] || { title: "Barcha Yangiliklar", empty: "Hozircha yangiliklar yo'q." };

  const dbNews = db.prepare('SELECT * FROM news WHERE visible = 1 ORDER BY date DESC').all() as any[];

  const newsList = dbNews.map(item => ({
    id: item.id,
    date: new Date(item.date).toLocaleDateString(
      localeLang === 'uz' ? 'uz-UZ' : localeLang === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ),
    title: item[`title_${localeLang}`] || item.title_uz,
    desc: item[`content_${localeLang}`] || item.content_uz,
    image: item.image || null
  }));

  return (
    <WebsiteLayout lang={localeLang}>
      {/* Hero Banner for Inner Page */}
      <div className="relative pt-40 pb-20 bg-primary overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img src="/voha-actual-bg.png" alt="Background" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
         </div>
         <div className="max-container relative z-10 px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">{t.title}</h1>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
         </div>
      </div>

      <div className="py-20 px-6 max-container min-h-[50vh]">
        {newsList.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-20 bg-gray-50 rounded-3xl border border-gray-100">
            {t.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {newsList.map(item => (
               <a href={`/${localeLang}/news/${item.id}`} key={item.id} className="group bg-white rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 flex flex-col block">
                  <div className="h-72 overflow-hidden relative shrink-0 bg-gray-50 flex items-center justify-center p-2">
                     <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-all z-10 duration-500"></div>
                     <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                       {item.image ? (
                         <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                           <Newspaper size={64} className="text-gray-400 transform group-hover:scale-110 transition-transform duration-700" />
                         </div>
                       )}
                     </div>
                     <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-4 py-2 rounded-full z-20 shadow-lg">
                       {item.date}
                     </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col justify-between">
                     <div>
                       <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                       <p className="text-gray-500 text-base leading-relaxed line-clamp-3 font-medium">{item.desc}</p>
                     </div>
                     <div className="mt-6 flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
                       Batafsil <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                     </div>
                  </div>
               </a>
             ))}
          </div>
        )}
      </div>
    </WebsiteLayout>
  );
}
