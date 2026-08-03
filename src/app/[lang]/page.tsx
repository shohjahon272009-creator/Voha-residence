 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Hero from '@/components/website/Hero';
import { getProjects, getApartments } from '@/lib/actions';
import ProjectsList from '@/components/website/ProjectsList';
import CategoryShowcase from '@/components/website/CategoryShowcase';
import ApartmentBrowser from '@/components/website/ApartmentBrowser';
import MortgageCalculator from '@/components/website/MortgageCalculator';
import NewsSection from '@/components/website/NewsSection';
import SalesOfficesSection from '@/components/website/SalesOfficesSection';
import ContactSection from '@/components/website/ContactSection';
import { Locale, getDictionary } from '@/lib/dictionaries';
import AnimatedReveal from '@/components/website/AnimatedReveal';
import VohaLogo from '@/components/common/VohaLogo';

import db from '@/lib/db';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const localeLang = lang as Locale;
  const dict = getDictionary(localeLang);

  const settingsRows = await db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
  const companyName = settings.company_name || 'Qurilish';

  // Bosh sahifa slideri uchun loyiha rasmlari (eng yangi loyihalar oldinda)
  const allProjects = await getProjects();
  const heroImages = allProjects
    .map((p) => p.main_image)
    .filter((img): img is string => Boolean(img))
    .slice(0, 8);

  // Xonadon brauzeri uchun — narxlar mijozga yuborilmaydi (xavfsizlik)
  const browserApartments = (await getApartments()).map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

  const aboutText: Record<Locale, { tag: string; title: string; accent: string; desc: string; stat1value: string; stat1label: string; stat2value: string; stat2label: string }> = {
    uz: { tag: 'BIZ HAQIMIZDA', title: ``, accent: 'Sifatli', desc: "Biz yillar tajribasi asosida O'zbekiston bozorida xalqaro standartlarga javob beruvchi yirik turar-joy majmualarini barpo etib kelmoqdamiz.", stat1value: 'Katta', stat1label: 'Tajriba', stat2value: 'Ko\'p', stat2label: 'Barpo etilgan loyihalar' },
    ru: { tag: 'О НАС', title: ``, accent: 'Качественное', desc: 'На основе многолетнего опыта мы возводим современные жилые комплексы, соответствующие международным стандартам.', stat1value: 'Много', stat1label: 'Опыта', stat2value: 'Много', stat2label: 'Проектов' },
    en: { tag: 'ABOUT US', title: ``, accent: 'Quality', desc: "Based on years of experience, we've been building modern residential complexes that meet international standards.", stat1value: 'Great', stat1label: 'Experience', stat2value: 'Many', stat2label: 'Projects built' },
  };
  const about = aboutText[localeLang] || aboutText.uz;

  return (
    <WebsiteLayout lang={localeLang} companyName={companyName}>
      <Hero lang={localeLang} companyName={companyName} heroTitle={settings.hero_title} heroDesc={settings.hero_desc} images={heroImages} />
      {settings.show_projects !== 'false' && <ProjectsList lang={localeLang} companyName={companyName} limit={6} />}
      <CategoryShowcase projects={allProjects} lang={localeLang} />
      {settings.show_search !== 'false' && <ApartmentBrowser apartments={browserApartments} projects={allProjects} lang={localeLang} />}
      {settings.show_mortgage !== 'false' && <MortgageCalculator lang={localeLang} />}
      
      {/* About Section */}
      {settings.show_about !== 'false' && (
      <section id="about" className="py-32 px-6 bg-brand-mesh-lux relative overflow-hidden">
        {/* Soft elegant background blobs */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/15 to-transparent z-0"></div>
        <div className="max-container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
           <AnimatedReveal direction="left" className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden border-[15px] border-white shadow-2xl relative z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                 <img src="/voha-actual-bg.png" alt="About Us" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-accent rounded-[40px] -z-0 opacity-40 transform rotate-6" />
           </AnimatedReveal>
           
           <AnimatedReveal direction="right">
              <span className="eyebrow mb-5">{about.tag}</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 leading-tight flex flex-col items-start gap-y-4">
                 <VohaLogo isScrolled={true} className="w-56 sm:w-64 lg:w-72 h-auto shrink-0" />
                 <span>
                    {localeLang === 'uz' && settings.about_title ? settings.about_title :
                      <>{about.title}<span className="text-gradient-accent">{about.accent}</span>{localeLang === 'uz' ? ' va ishonchli qurilish' : (localeLang === 'ru' ? ' строительство' : ' construction')}</>
                    }
                 </span>
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium">
                 {localeLang === 'uz' && settings.about_desc ? settings.about_desc : about.desc}
              </p>
              
              <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-3xl shadow-xl shadow-accent/5">
                 <div className="flex flex-col">
                    <div className="text-4xl font-black text-primary mb-2 tracking-tighter">
                       {localeLang === 'uz' && settings.about_stat1_value ? settings.about_stat1_value : about.stat1value}
                    </div>
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-widest">
                       {localeLang === 'uz' && settings.about_stat1_label ? settings.about_stat1_label : about.stat1label}
                    </div>
                 </div>
                 <div className="flex flex-col border-l-2 border-gray-100 pl-8">
                    <div className="text-4xl font-black text-accent mb-2 tracking-tighter">
                       {localeLang === 'uz' && settings.about_stat2_value ? settings.about_stat2_value : about.stat2value}
                    </div>
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-widest">
                       {localeLang === 'uz' && settings.about_stat2_label ? settings.about_stat2_label : about.stat2label}
                    </div>
                 </div>
              </div>
           </AnimatedReveal>
        </div>
      </section>
      )}

      {settings.show_news !== 'false' && <NewsSection lang={localeLang} />}
      <SalesOfficesSection lang={localeLang} />
      {settings.show_contact !== 'false' && <ContactSection lang={localeLang} />}
    </WebsiteLayout>
  );
}
