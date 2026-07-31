 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import { Locale } from '@/lib/dictionaries';
import { ArrowRight, Newspaper } from 'lucide-react';
import db from '@/lib/db';
import AnimatedReveal from './AnimatedReveal';

export default function NewsSection({ lang }: { lang: Locale }) {
  const t = {
    uz: { title: "So'nggi Yangiliklar", subtitle: "YANGILIKLAR", more: "Barchasini o'qish" },
    ru: { title: "Последние новости", subtitle: "НОВОСТИ", more: "Читать все" },
    en: { title: "Latest News", subtitle: "NEWS", more: "Read all" },
  }[lang] || { title: "So'nggi Yangiliklar", subtitle: "YANGILIKLAR", more: "Barchasini o'qish" };

   
  const dbNews = db.prepare('SELECT * FROM news WHERE visible = 1 ORDER BY date DESC LIMIT 3').all() as any[];

  const news = dbNews.map(item => ({
    id: item.id,
    date: new Date(item.date).toLocaleDateString(
      lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ),
    title: item[`title_${lang}`] || item.title_uz,
    desc: item[`content_${lang}`] || item.content_uz,
    image: item.image || '/voha-actual-bg.png'
  }));

  if (news.length === 0) return null;

  return (
    <section id="news" className="py-32 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
           <AnimatedReveal direction="up">
             <span className="eyebrow mb-5">{t.subtitle}</span>
             <h2 className="text-4xl md:text-5xl font-bold text-primary">{t.title}</h2>
           </AnimatedReveal>
           <AnimatedReveal direction="left">
             <a href={`/${lang}/news`} className="flex items-center gap-2 font-bold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent pb-1 inline-flex">
               {t.more} <ArrowRight size={18} />
             </a>
           </AnimatedReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {news.map((item, index) => (
             <AnimatedReveal key={item.id} direction="up" delay={index * 0.1}>
             <a href={`/${lang}/news/${item.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 flex flex-col block">
                <div className="h-64 overflow-hidden relative shrink-0 bg-gray-100 flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-all z-10 duration-500"></div>
                   {item.image ? (
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <Newspaper size={48} className="text-gray-300 transform group-hover:scale-110 transition-transform duration-700" />
                   )}
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full z-20">
                     {item.date}
                   </div>
                </div>
                <div className="p-8 flex-grow">
                   <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                   <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{item.desc}</p>
                </div>
             </a>
             </AnimatedReveal>
           ))}
        </div>
      </div>
    </section>
  );
}
