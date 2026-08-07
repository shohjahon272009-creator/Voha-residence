/* eslint-disable react/no-unescaped-entities */
 
 
 
 
import React from 'react';
import { getApartments, getProjects } from '@/lib/actions';
import AdminBlockSection from '@/components/admin/AdminBlockSection';
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
            <SiteVisibilityToggle
              settingKey="show_locations"
              initialOn={settings.show_locations !== 'false'}
              label="Joylashuv bo‘yicha filtr"
              hint="Maktab, park, suv bo‘yida ..."
            />
         </div>
      </div>

      <div className="space-y-3">
        {sortedProjects.map(project => (
          <AdminBlockSection
            key={project.id}
            project={project}
            apts={allApartments.filter(a => a.project_id === project.id)}
          />
        ))}
      </div>
    </div>
  );
}
