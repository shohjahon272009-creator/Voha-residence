/* eslint-disable react/no-unescaped-entities */
 
 
 
 
import React from 'react';
import { Building2 } from 'lucide-react';
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

  // Xonadoni bor loyihalar birinchi, bo'shlari oxirida — admin adashmasligi uchun
  const aptCount = (id: number) => allApartments.filter(a => a.project_id === id).length;
  const sortedProjects = [...projects].sort((a, b) => aptCount(b.id) - aptCount(a.id));

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

      {sortedProjects.map(project => {
        const apts = allApartments.filter(a => a.project_id === project.id);
        const floors = Array.from(new Set(apts.map(a => a.floor))).sort((a, b) => a - b);
        const empty = apts.length === 0;

        return (
          <div key={project.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                     <Building2 size={19} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                     <h3 className="font-bold text-lg text-primary leading-tight truncate">{project.name_uz}</h3>
                     <span className="text-xs text-gray-400 font-medium">{apts.length} xonadon</span>
                  </div>
               </div>
               <AddApartmentModal projectId={project.id} projectName={project.name_uz} />
            </div>

            {empty ? (
               <p className="text-xs text-gray-400">Hali xonadon yo&apos;q — <span className="font-bold text-primary">&quot;Xonadon qo&apos;shish&quot;</span> tugmasi bilan qo&apos;shing.</p>
            ) : (
               <div className="space-y-5">
                  {floors.map(floor => {
                    const floorApts = apts.filter(a => a.floor === floor);
                    return (
                      <div key={floor}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{floor}-qavat</span>
                          <span className="text-[10px] font-bold text-gray-300">{floorApts.length} ta</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {floorApts.map(apt => (
                            <EditApartmentModal key={apt.id} apt={apt} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
