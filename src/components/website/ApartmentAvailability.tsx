 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import React from 'react';
import Link from 'next/link';
import { getProjects, getApartments } from '@/lib/actions';
import { Locale, getDictionary } from '@/lib/dictionaries';
import AnimatedReveal from './AnimatedReveal';

export default function ApartmentAvailability({ lang }: { lang: Locale }) {
  const projects = getProjects();
  const allApartments = getApartments();
  const dict = getDictionary(lang);

  const labels: Record<Locale, { title: string; sectionTag: string; bookNow: string; floors: string; available: string; booked: string; sold: string; soldOut: string; comingSoon: string }> = {
    uz: { title: "Xonadonlar holati", sectionTag: "JORIY HOLAT", bookNow: "Bron qilish", floors: "qavat", available: "Bo'sh", booked: "Bronlangan", sold: "Band", soldOut: "Barcha xonadonlar sotib tugatilgan", comingSoon: "Xonadonlar ma'lumoti tez orada e'lon qilinadi" },
    ru: { title: "Статус квартир", sectionTag: "ТЕКУЩИЙ СТАТУС", bookNow: "Забронировать", floors: "этаж", available: "Свободно", booked: "Забронировано", sold: "Продано", soldOut: "Все квартиры проданы", comingSoon: "Информация о квартирах скоро появится" },
    en: { title: "Apartment Availability", sectionTag: "LIVE STATUS", bookNow: "Book Now", floors: "floor", available: "Available", booked: "Booked", sold: "Sold", soldOut: "All apartments are sold out", comingSoon: "Apartment details coming soon" },
  };
  const t = labels[lang] || labels.uz;

  return (
    <section id="apartments" className="py-32 px-6 relative overflow-hidden bg-[#0A1A18]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid opacity-50 z-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-primary rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-container relative z-10">
        <AnimatedReveal direction="down" className="text-center mb-16 flex flex-col items-center">
          <span className="eyebrow eyebrow--center mb-5">{t.sectionTag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{t.title}</h2>
        </AnimatedReveal>

        <div className="space-y-16">
          {projects.map((project, index) => {
            const apts = allApartments.filter(a => a.project_id === project.id);
            const floors = Array.from(new Set(apts.map(a => a.floor))).sort((a, b) => a - b);
             
            const projectName = (project as any)[`name_${lang}`] || project.name_uz;

            const availableCount = apts.filter(a => a.status === "Bo'sh").length;
            const bookedCount = apts.filter(a => a.status === 'Bronlangan').length;

            return (
              <AnimatedReveal key={project.id} delay={index * 0.15} direction="up">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-2xl">
                  {/* Project Header */}
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{projectName}</h3>
                      <p className="text-sm text-gray-400">{project.district}, {project.city}</p>
                    </div>

                    {/* Live Stats */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm">
                        <span className="w-3 h-3 rounded-full bg-success inline-block shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                        <span className="text-sm font-bold text-white">{t.available}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm">
                        <span className="w-3 h-3 rounded-full bg-warning inline-block shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <span className="text-sm font-bold text-white">{t.booked}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm">
                        <span className="w-3 h-3 rounded-full bg-danger inline-block shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                        <span className="text-sm font-bold text-white">{t.sold}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditional Grid Rendering */}
                  {(availableCount > 0 || bookedCount > 0) ? (
                    <>
                      {/* Visual Floor Grid */}
                      <div className="overflow-x-auto pb-4">
                        <div className="space-y-3 min-w-[500px]">
                          {floors.map(floor => {
                            const floorApts = apts.filter(a => a.floor === floor);
                            return (
                              <div key={floor} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-16 text-right shrink-0">
                                  {floor} {t.floors}
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                  {floorApts.map(apt => (
                                    <Link
                                      key={apt.id}
                                      href={`/${lang}/projects/${project.id}`}
                                      title={`№${apt.number} — ${apt.area}m² — ${apt.rooms} xona`}
                                      className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold 
                                        transition-all hover:scale-110 cursor-pointer
                                        ${apt.status === "Bo'sh"
                                          ? 'bg-success/10 text-success border-2 border-success/30 hover:bg-success hover:text-white'
                                          : apt.status === 'Bronlangan'
                                          ? 'bg-warning/10 text-warning border-2 border-warning/30 hover:bg-warning hover:text-white'
                                          : 'bg-danger/10 text-danger border-2 border-danger/30 opacity-70 cursor-default hover:scale-100'
                                        }
                                      `}
                                    >
                                      {apt.number}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend & CTA */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-8 pt-6 border-t border-white/10 gap-4">
                        <div className="flex flex-wrap gap-6 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-success/20 border border-success/40" /> {t.available}</span>
                          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-warning/20 border border-warning/40" /> {t.booked}</span>
                          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-danger/20 border border-danger/40" /> {t.sold}</span>
                        </div>
                        <Link
                          href={`/${lang}/projects/${project.id}`}
                          className="px-8 py-3 bg-accent text-primary font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(250,218,165,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        >
                          {dict.apartments.book}
                        </Link>
                      </div>
                    </>
                  ) : apts.length === 0 ? (
                    <div className="mt-8 pt-10 border-t border-white/10 text-center">
                      <div className="inline-block px-6 py-3 bg-white/5 text-gray-300 border border-white/15 rounded-xl font-bold uppercase tracking-widest text-sm">
                        {t.comingSoon}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-10 border-t border-white/10 text-center">
                      <div className="inline-block px-6 py-3 bg-danger/10 text-danger border border-danger/20 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(248,113,113,0.2)]">
                        {t.soldOut}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
