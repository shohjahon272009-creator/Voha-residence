 
 
 
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import ProjectCard from './ProjectCard';
import { getProjects, getApartments } from '@/lib/actions';
import { Locale } from '@/lib/dictionaries';
import AnimatedReveal from './AnimatedReveal';
import VohaLogo from '@/components/common/VohaLogo';

export default function ProjectsList({ lang, companyName = 'QURILISH KOMPANIYA', limit }: { lang: Locale, companyName?: string, limit?: number }) {
  const projects = getProjects();
  const allApartments = getApartments();
  // Compute availability server-side. Only a `soldOut` boolean is sent to the client —
  // the exact remaining count and the real price never leave the server.
  const allCards = projects.map(p => {
    const apts = allApartments.filter(a => a.project_id === p.id);
    const available = apts.filter(a => a.status === "Bo'sh").length;
    const soldOut = apts.length > 0 && available === 0;
    return { project: { ...p, min_price: 0 }, soldOut };
  });
  // Bosh sahifada faqat bir nechta asosiy loyiha; loyihalar bo'limida hammasi.
  const cards = limit ? allCards.slice(0, limit) : allCards;
  const hasMore = limit ? allCards.length > limit : false;

  const sectionLabels: Record<Locale, { title: string; subtitle: string; viewAll: string }> = {
    uz: { title: "Bizning turar-joy majmualarimiz", subtitle: "LOYIHALARIMIZ", viewAll: "Hammasini ko'rish" },
    ru: { title: "Наши жилые комплексы", subtitle: "ПРОЕКТЫ", viewAll: "Смотреть все" },
    en: { title: "Our Residential Complexes", subtitle: "OUR PROJECTS", viewAll: "View All" },
  };
  const labels = sectionLabels[lang] || sectionLabels.uz;

  return (
    <section id="projects" className="py-28 px-6 relative overflow-hidden bg-brand-mesh">
      {/* Aurora — official Voha palette: teal + bronze + olive */}
      <div className="absolute -top-44 -right-24 w-[48rem] h-[48rem] rounded-full bg-primary/[0.14] blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-[44rem] h-[44rem] rounded-full bg-accent/[0.22] blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-44 right-1/3 w-[40rem] h-[40rem] rounded-full bg-[#828C4C]/[0.16] blur-[130px] pointer-events-none" />
      {/* Warm sand top fade */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#f8f3e8] to-transparent pointer-events-none" />

      <div className="max-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <AnimatedReveal direction="up" className="max-w-xl">
            <span className="eyebrow mb-5">{labels.subtitle}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              {labels.title.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-gradient-accent">{labels.title.split(' ').slice(2, 4).join(' ')}</span>{' '}
              {labels.title.split(' ').slice(4).join(' ')}
            </h2>
          </AnimatedReveal>
          {hasMore && (
          <AnimatedReveal direction="left" className="flex gap-4">
            <a href={`/${lang}/projects`} className="group px-7 py-3.5 border border-primary/15 text-primary font-bold rounded-full hover:bg-primary hover:border-primary hover:text-white transition-all inline-flex items-center gap-2">
              {labels.viewAll}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
            </a>
          </AnimatedReveal>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map(({ project, soldOut }, index) => (
            <AnimatedReveal key={project.id} direction="up" delay={index * 0.1}>
            <ProjectCard
              key={project.id}
              project={project}
              lang={lang}
              soldOut={soldOut}
            />
            </AnimatedReveal>
          ))}
        </div>

        {/* Promo Banner Section */}
        <AnimatedReveal direction="up" className="mt-32 rounded-[40px] overflow-hidden flex flex-col md:flex-row bg-white shadow-2xl relative">
          {/* Diagonal cut effect on desktop */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 w-40 bg-white skew-x-12 z-10 transform -translate-x-1/2 origin-bottom"></div>
                    <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 -rotate-90 hidden 2xl:block opacity-5 pointer-events-none">
              <h2 className="text-[120px] font-black tracking-tighter whitespace-nowrap">
                 {companyName.toUpperCase()}
              </h2>
           </div> 
          
          <div className="md:w-1/2 p-6 sm:p-8 md:p-12 lg:p-20 relative z-20 flex flex-col justify-center bg-white">
            <AnimatedReveal direction="left" delay={0.2}>
              <div className="mb-6 md:mb-10 w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[360px]">
                 <VohaLogo isScrolled={true} className="w-full h-auto" />
              </div>
              <p className="text-gray-600 mb-8 md:mb-10 max-w-md text-base sm:text-lg font-medium leading-relaxed">
                {lang === 'uz' ? "2026-yilda topshiriladigan maxsus loyihadan xonadon xarid qiling! Boshlang'ich to'lovni amalga oshirib, 30 oylik muddatli to'lovda orzuingizdagi uyni xarid qilishingiz mumkin." :
                 lang === 'ru' ? "Приобретайте квартиру в специальном проекте, который будет сдан в 2026 году! Внеся первоначальный взнос, вы можете купить дом своей мечты в рассрочку на 30 месяцев." :
                 "Buy an apartment in a special project to be delivered in 2026! By making an initial payment, you can buy your dream home in installments for 30 months."}
              </p>
              <div>
                 <a href={`/${lang}#contact`} className="px-6 sm:px-8 md:px-10 py-3 md:py-4 bg-primary text-white rounded-full font-bold hover:bg-accent hover:text-primary transition-all shadow-xl flex items-center gap-3 w-max text-sm sm:text-base">
                   {lang === 'uz' ? "Batafsil ma'lumot" : lang === 'ru' ? "Подробнее" : "More details"}
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                 </a>
              </div>
            </AnimatedReveal>
          </div>
          
          <div className="md:w-1/2 relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
             <img src="/voha-actual-bg.png" className="absolute inset-0 w-full h-full object-cover" alt="Voha Promo" />
             <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent mix-blend-multiply z-0"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>
             
             <AnimatedReveal direction="right" delay={0.4} className="absolute inset-0 z-20 p-6 sm:p-8 md:p-12 lg:p-20 flex flex-col justify-between text-white">
                <div className="text-right">
                   <span className="text-6xl sm:text-7xl lg:text-[100px] font-black tracking-tighter text-white drop-shadow-2xl">2026</span>
                   <p className="text-xs sm:text-sm lg:text-base uppercase tracking-widest text-accent font-bold mt-[-5px] md:mt-[-10px] drop-shadow-md">
                     {lang === 'uz' ? "loyiha kalitlari topshiriladi" : lang === 'ru' ? "сдача ключей проекта" : "project keys handed over"}
                   </p>
                </div>
                
                <div className="flex items-end gap-2 md:gap-4">
                   <span className="text-7xl sm:text-8xl lg:text-[140px] font-black leading-none text-white drop-shadow-2xl">30</span>
                   <div className="pb-2 md:pb-4 lg:pb-8">
                      <p className="text-xl sm:text-2xl lg:text-4xl font-light drop-shadow-md">
                        {lang === 'uz' ? "oylik" : lang === 'ru' ? "месяцев" : "months"}
                      </p>
                      <p className="text-lg sm:text-2xl lg:text-5xl font-black text-accent drop-shadow-lg leading-tight">
                        {lang === 'uz' ? "muddatli to'lov" : lang === 'ru' ? "рассрочка" : "installment plan"}
                      </p>
                   </div>
                </div>
             </AnimatedReveal>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
