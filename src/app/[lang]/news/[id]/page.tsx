 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { Newspaper, ArrowLeft, Calendar } from 'lucide-react';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import PageHero from '@/components/website/PageHero';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params;
  const n = await db.prepare('SELECT * FROM news WHERE id = ? AND visible = 1').get(id) as Record<string, string> | undefined;
  if (!n) return { title: 'Yangilik topilmadi — Voha Residence' };
  const title = `${n[`title_${lang}`] || n.title_uz} — Voha Residence`;
  const description = String(n[`content_${lang}`] || n.content_uz || '').replace(/\s+/g, ' ').slice(0, 160);
  const t = { title, description };
  // data URL rasm OG uchun yaramaydi — faqat oddiy manzil bo'lsa ishlatamiz
  const img = n.image && !String(n.image).startsWith('data:') ? n.image : undefined;
  return pageMetadata(lang, `/news/${id}`, { uz: t, ru: t, en: t }, img);
}

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
      <PageHero lang={localeLang} kicker={date} title={title} images={image ? [image] : ['/uploads/majmua-1.jpg']}>
        <a href={`/${localeLang}/news`} className="inline-flex items-center gap-2 text-white/80 font-bold hover:text-accent transition-colors bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
          <ArrowLeft size={18} />
          {t.back}
        </a>
      </PageHero>

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
