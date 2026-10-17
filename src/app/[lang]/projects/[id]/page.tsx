/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import AnimatedReveal from '@/components/website/AnimatedReveal';
import FloorPlanWrapper from '@/components/website/FloorPlanWrapper';
import VirtualTour from '@/components/website/VirtualTour';
import ProjectStatusBadge from '@/components/website/ProjectStatusBadge';
import ProjectGallery from '@/components/website/ProjectGallery';
import PageHero from '@/components/website/PageHero';
import BuySteps from '@/components/website/BuySteps';
import { getProjectBySlug, getApartments } from '@/lib/actions';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { notFound } from 'next/navigation';
import { MapPin, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// Doim yangi ma'lumot — admin o'zgartirsa darhol ko'rinadi
export const dynamic = 'force-dynamic';

// Har bir loyiha uchun alohida SEO (sarlavha + tavsif + OG rasm)
export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params;
  const project = await getProjectBySlug(parseInt(id));
  if (!project) return { title: 'Loyiha topilmadi — Voha Residence' };
  const name = (project as unknown as Record<string, string>)[`name_${lang}`] || project.name_uz;
  const city = project.city || 'Xorazm';
  const desc = (project as unknown as Record<string, string>)[`description_${lang}`] ||
    `${name} — ${city}dagi zamonaviy turar-joy majmuasi. Xonadonlar, chizmalar, narx va qulay to‘lov shartlari.`;
  const t = { title: `${name} — Voha Residence`, description: desc.slice(0, 160) };
  const img = project.main_image && !project.main_image.startsWith('data:') ? project.main_image : undefined;
  return pageMetadata(lang, `/projects/${id}`, { uz: t, ru: t, en: t }, img);
}

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
      {/* Kino-sarlavha: loyiha rasmi + galereyadan bir nechtasi sekin almashadi */}
      <PageHero
        lang={lang}
        size="full"
        kicker={[project.district, project.city].filter(Boolean).join(', ') || project.status}
        title={projectName}
        subtitle={(projectDesc || 'Premium klassdagi zamonaviy xonadonlar').slice(0, 220)}
        images={[project.main_image || '/cinema/poster.webp', ...(Array.isArray(project.gallery) ? project.gallery.slice(0, 3) : [])]}
        overlay={
          <>
            <div className="absolute top-24 right-6 md:right-10 z-20">
              <ProjectStatusBadge
                status={project.status}
                daysLeft={project.days_left}
                soldOut={isSoldOut}
                lang={lang as Locale}
                className="text-sm px-5 py-2.5"
              />
            </div>
            {hasVirtualTour && (
              <VirtualTour
                url={project.virtual_tour_url}
                tourScenes={tourScenes}
                lang={lang as Locale}
                projectName={projectName}
              />
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm font-medium">
          <span className="flex items-center gap-2"><MapPin size={16} className="text-accent" /> {project.district}, {project.city}</span>
          <span className="flex items-center gap-2"><CheckCircle size={16} className="text-accent" /> {project.status}</span>
        </div>
      </PageHero>

      {/* Photo gallery — showcases the building's real photos */}
      {Array.isArray(project.gallery) && project.gallery.length > 0 && (
        <section className="py-16 md:py-20 px-6 bg-brand-mesh">
          <div className="max-container">
            <AnimatedReveal direction="up">
              <ProjectGallery images={project.gallery} projectName={projectName} lang={lang as Locale} />
            </AnimatedReveal>
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
                        {/* eslint-disable-next-line @next/next/no-img-element -- rasm bazadan (data URL / Blob), next/image optimallashtira olmaydi */}
                        <img src={project.main_image || '/cinema/poster.webp'} alt={projectName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <div className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl">
                              <span className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                                 {dict.projects.status.soldOut || 'Sotib tugatilgan'}
                              </span>
                           </div>
                        </div>
                     </div>
                  ) : publicApartments.length === 0 ? (
                     <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative group aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element -- rasm bazadan (data URL / Blob), next/image optimallashtira olmaydi */}
                        <img src={project.main_image || '/cinema/poster.webp'} alt={projectName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <div className="px-8 py-5 bg-white/10 border border-white/20 rounded-2xl text-center">
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
               
               <AnimatedReveal direction="right" className="space-y-8">
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
               </AnimatedReveal>
            </div>
         </div>
      </section>
      <BuySteps lang={lang} />
    </WebsiteLayout>
  );
}
