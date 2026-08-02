 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { Newspaper, ArrowLeft, Calendar } from 'lucide-react';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const localeLang = lang as Locale;
  const dict = getDictionary(localeLang);

  const t = {
    uz: { back: "Orqaga", notFound: "Yangilik topilmadi" },
    ru: { back: "Назад", notFound: "Новость не найдена" },
    en: { back: "Back", notFound: "News not found" }
  }[localeLang] || { back: "Orqaga", notFound: "Yangilik topilmadi" };

  const newsItem = await db.prepare('SELECT * FROM news WHERE id = ? AND visible = 1').get(id) as any;

  if (!newsItem) {
    redirect(`/${localeLang}/news`);
  }

  const date = new Date(newsItem.date).toLocaleDateString(
    localeLang === 'uz' ? 'uz-UZ' : localeLang === 'ru' ? 'ru-RU' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
  
  const title = newsItem[`title_${localeLang}`] || newsItem.title_uz;
  const content = newsItem[`content_${localeLang}`] || newsItem.content_uz;
  const image = newsItem.image || null;

  return (
    <WebsiteLayout lang={localeLang}>
      {/* Hero Banner for Inner Page */}
      <div className="relative pt-40 pb-20 bg-primary overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img src="/voha-actual-bg.png" alt="Background" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
         </div>
         <div className="max-container relative z-10 px-6">
            <a href={`/${localeLang}/news`} className="inline-flex items-center gap-2 text-accent font-bold hover:text-white transition-colors mb-8 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 shadow-lg">
              <ArrowLeft size={18} />
              {t.back}
            </a>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg max-w-4xl">{title}</h1>
            <div className="flex items-center gap-3 text-white/80 font-medium bg-black/20 w-max px-4 py-2 rounded-full backdrop-blur-sm">
              <Calendar size={18} className="text-accent" />
              {date}
            </div>
         </div>
      </div>

      <div className="py-20 px-6 max-container min-h-[50vh]">
        <div className="max-w-4xl mx-auto">
          {image ? (
            <div className="w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl mb-16 bg-gray-100 border-4 border-white">
               <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl mb-16 bg-primary/5 flex items-center justify-center border-4 border-white">
               <Newspaper size={80} className="text-gray-300" />
            </div>
          )}

          <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed font-medium">
            {content.split('\n').map((paragraph: string, index: number) => (
               <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
