/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import FloorPlanWrapper from '@/components/website/FloorPlanWrapper';
import VirtualTour from '@/components/website/VirtualTour';
import ProjectStatusBadge from '@/components/website/ProjectStatusBadge';
import ProjectGallery from '@/components/website/ProjectGallery';
import { getProjectBySlug, getApartments } from '@/lib/actions';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { notFound } from 'next/navigation';
import { MapPin, CheckCircle } from 'lucide-react';

export default async function ProjectDetailPage({ params }: { params: Promise<{ lang: string, id: string }> }) {
  const { lang, id } = await params;
  const project = await getProjectBySlug(parseInt(id));
  const apartments = await getApartments(parseInt(id));

  if (!project) return notFound();

  // SECURITY: strip real prices before the apartment data reaches the client bundle.
  // The public floor plan hides prices behind a "Narxini bilish" request, so the
  // actual figures must never appear in the page source (competitors could read them).
  const publicApartments = apartments.map((a) => ({ ...a, price_cash: 0, price_installment: 0, note: '' }));

   
  const projectName = (project as any)[`name_${lang}`] || project.name_uz;
  const projectDesc = (project as any)[`description_${lang}`] || '';
  const dict = getDictionary(lang as Locale);
  // "Sotib tugatilgan" — admin belgilagan loyiha bayrog'idan (xonadon holatidan emas)
  const isSoldOut = Boolean((project as any).is_sold_out);

  // Parse the optional multi-scene virtual tour (JSON) safely
  let tourScenes: import('@/lib/types').TourScene[] | undefined;
  try {
    const raw = (project as any).tour_scenes;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) tourScenes = parsed;
    }
  } catch { tourScenes = undefined; }
  const hasVirtualTour = Boolean(project.virtual_tour_url || tourScenes);

  return (
    <WebsiteLayout lang={lang as Locale}>
      {/* Mini Hero */}
      <section className="relative h-[60vh] flex items-end pb-20 px-6">
        <div 
           className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: `url(${project.main_image || '/voha-actual-bg.png'})` }}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />
        </div>

        {/* Status badge in the corner of the hero image */}
        <div className="absolute top-24 right-6 md:right-10 z-20">
           <ProjectStatusBadge
             status={project.status}
             daysLeft={project.days_left}
             soldOut={isSoldOut}
             lang={lang as Locale}
             className="text-sm px-5 py-2.5"
           />
        </div>

        {/* 360° Virtual tour pin — shown when a tour (image, scenes, or URL) is configured */}
        {hasVirtualTour && (
          <VirtualTour
            url={project.virtual_tour_url}
            tourScenes={tourScenes}
            lang={lang as Locale}
            projectName={projectName}
          />
        )}

        <div className="max-w-4xl text-white relative z-10">
           <div className="flex items-center gap-4 text-accent/80 mb-6 font-medium tracking-wide">
              <span className="flex items-center gap-2"><MapPin size={18} /> {project.district}, {project.city}</span>
              <span className="flex items-center gap-2"><CheckCircle size={18} /> {project.status}</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-bold mb-4">{projectName}</h1>
           <p className="text-xl text-white/60 max-w-2xl">{projectDesc || 'Premium klassdagi zamonaviy xonadonlar'}</p>
        </div>
      </section>

      {/* Photo gallery — showcases the building's real photos */}
      {Array.isArray(project.gallery) && project.gallery.length > 0 && (
        <section className="py-16 md:py-20 px-6 bg-brand-mesh">
          <div className="max-container">
            <ProjectGallery images={project.gallery} projectName={projectName} lang={lang as Locale} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-20 px-6 bg-brand-mesh">
         <div className="max-container">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
               <div className="col-span-1 lg:col-span-3">
                  {isSoldOut ? (
                     <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative group aspect-video">
                        <img src={project.main_image || '/voha-actual-bg.png'} alt={projectName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                           <div className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                              <span className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                                 {dict.projects.status.soldOut || 'Sotib tugatilgan'}
                              </span>
                           </div>
                        </div>
                     </div>
                  ) : publicApartments.length === 0 ? (
                     <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative group aspect-video">
                        <img src={project.main_image || '/voha-actual-bg.png'} alt={projectName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                           <div className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-center">
                              <span className="block text-2xl md:text-4xl font-black text-white tracking-wide drop-shadow-lg">
                                 {lang === 'ru' ? 'Квартиры скоро' : lang === 'en' ? 'Apartments coming soon' : "Xonadonlar tez orada"}
                              </span>
                              <span className="block text-sm md:text-base text-white/70 font-medium mt-2">
                                 {lang === 'ru' ? 'Информация о квартирах появится позже' : lang === 'en' ? 'Details will be published soon' : "Xonadonlar ma'lumoti tez orada e'lon qilinadi"}
                              </span>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <FloorPlanWrapper
                       apartments={publicApartments}
                       lang={lang as Locale}
                     />
                  )}
               </div>
               
               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/5">
                     <h4 className="font-bold text-xl text-primary mb-6">Loyha afzalliklari</h4>
                     <ul className="space-y-4">
                        {[
                          'Yopiq hovli', 
                          'Yer osti parking', 
                          'Bolalar maydonchasi', 
                          '24/7 Qorovul xizmati',
                          'Premium liftlar'
                        ].map((txt, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                             <CheckCircle size={16} className="text-accent" />
                             {txt}
                          </li>
                        ))}
                     </ul>
                  </div>

                  <div className="bg-accent p-8 rounded-3xl text-white shadow-xl shadow-accent/20">
                     <h4 className="font-bold text-xl mb-4">Sotuv ofisi</h4>
                     <p className="text-white/80 text-sm mb-6">Savollar bormi? Mutaxassislarimiz bilan bog'laning!</p>
                     <a href="tel:+998910116666" className="block text-2xl font-bold mb-2 hover:opacity-90 transition-opacity">+998 91 011 66 66</a>
                     <a href="tel:+998910116666" className="block text-center w-full py-3 bg-white text-primary font-bold rounded-xl mt-4 hover:bg-primary hover:text-white transition-colors">
                        Qo'ng'iroq qilish
                     </a>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </WebsiteLayout>
  );
}
