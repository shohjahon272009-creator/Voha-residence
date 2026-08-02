/* eslint-disable react/no-unescaped-entities */
 
 
 
 
import React from 'react';
import { getApartments, getProjects } from '@/lib/actions';
import EditApartmentModal from '@/components/admin/EditApartmentModal';
import AddApartmentModal from '@/components/admin/AddApartmentModal';
import SiteVisibilityToggle from '@/components/admin/SiteVisibilityToggle';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminApartments() {
  const projects = await getProjects();
  const allApartments = await getApartments();

  const settingsRows = await db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = settingsRows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);

  return (
    <div className="space-y-10">
      <div>
         <h1 className="text-3xl font-bold text-primary mb-2">Xonadonlar</h1>
         <p className="text-gray-400 text-sm">Barcha xonadonlar holati va ma'lumotlari.</p>
      </div>

      {/* Saytda ko'rsatish/yashirish — bir bosishda */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <h3 className="font-bold text-lg text-primary mb-1">Asosiy saytda ko‘rsatish</h3>
         <p className="text-gray-400 text-xs mb-5">Bu yerdan xonadonlar bo‘limlarini saytda yoqish yoki o‘chirish mumkin — darhol qo‘llanadi.</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SiteVisibilityToggle
              settingKey="show_search"
              initialOn={settings.show_search !== 'false'}
              label="Xonadon tanlash (qidiruv)"
              hint="filtr + chizma"
            />
         </div>
      </div>

      {projects.map(project => {
        const apts = allApartments.filter(a => a.project_id === project.id);
        const floors = Array.from(new Set(apts.map(a => a.floor))).sort((a, b) => a - b);

        return (
          <div key={project.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
               <h3 className="font-bold text-xl text-primary">{project.name_uz}</h3>
               <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="px-3 py-1 bg-success/10 text-success rounded-full">
                     {apts.filter(a => a.status === "Bo'sh").length} Bo'sh
                  </span>
                  <span className="px-3 py-1 bg-warning/10 text-warning rounded-full">
                     {apts.filter(a => a.status === 'Bronlangan').length} Bronlangan
                  </span>
                  <span className="px-3 py-1 bg-danger/10 text-danger rounded-full">
                     {apts.filter(a => a.status === 'Band').length} Band
                  </span>
                  <AddApartmentModal projectId={project.id} projectName={project.name_uz} />
               </div>
            </div>

            {apts.length === 0 && (
               <p className="text-sm text-gray-400 mb-4">Hozircha xonadon yo&apos;q. Yuqoridagi <span className="font-bold text-primary">&quot;Xonadon qo&apos;shish&quot;</span> tugmasi bilan qo&apos;shing.</p>
            )}

            <div className="space-y-4 overflow-x-auto pb-2">
               {floors.map(floor => {
                 const floorApts = apts.filter(a => a.floor === floor);
                 return (
                   <div key={floor} className="flex items-center gap-3">
                     <span className="text-xs font-bold text-gray-400 w-16 text-right shrink-0">{floor} qavat</span>
                     <div className="flex gap-2 flex-wrap">
                       {floorApts.map(apt => (
                         <EditApartmentModal key={apt.id} apt={apt} />
                       ))}
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
