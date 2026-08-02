/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { Edit2, Trash2, MapPin, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getProjects, getApartments } from '@/lib/actions';
import Link from 'next/link';
import ProjectRowActions from '@/components/admin/ProjectRowActions';
import AddProjectModal from '@/components/admin/AddProjectModal';

export const dynamic = 'force-dynamic';

export default async function AdminSoldOutProjects() {
  const allProjects = await getProjects();
  const allApts = await getApartments();

  // Filter projects where there are NO available ("Bo'sh") apartments
  const projects = allProjects.filter(project => {
    const apts = allApts.filter(a => a.project_id === project.id);
    const available = apts.filter(a => a.status === "Bo'sh").length;
    return apts.length > 0 && available === 0;
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Sotib tugatilgan loyihalar</h1>
            <p className="text-gray-400 text-sm">Barcha xonadonlari to'liq sotilgan va band qilingan loyihalar ro'yxati.</p>
         </div>
         <AddProjectModal isSoldOut={true} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loyiha</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manzil</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holati</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xonadonlar</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Narx (dan)</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {projects.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-8 py-10 text-center text-gray-400">
                     Sotib tugatilgan loyihalar mavjud emas
                   </td>
                 </tr>
               ) : projects.map((project) => {
                 const apts = allApts.filter(a => a.project_id === project.id);
                 return (
                   <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <img src={project.main_image || "/voha-actual-bg.png"} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div>
                               <div className="font-bold text-primary text-sm">{project.name_uz}</div>
                               <div className="text-[10px] text-gray-400">{project.total_floors} qavat</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={12} className="text-gray-300" />
                            {project.district}, {project.city}
                         </div>
                      </td>
                       <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                            project.status === 'Jarayonda' ? 'bg-blue-50 text-blue-500' :
                            project.status === 'Topshirilgan' ? 'bg-success/10 text-success' : 
                            project.status === 'Sanoqli kunlar qoldi' ? 'bg-purple-50 text-purple-500' :
                            'bg-amber-50 text-amber-500'
                          }`}>
                             {project.status}
                          </span>
                       </td>
                      <td className="px-8 py-5">
                         <div className="text-sm">
                           <span className="font-bold text-success">0 bo'sh</span>
                           <span className="text-gray-400"> / {apts.length} jami</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-primary text-sm">
                         {(project.min_price / 1000000).toLocaleString()} mln
                      </td>
                      <td className="px-8 py-5">
                         <ProjectRowActions project={project} />
                      </td>
                   </tr>
                 );
               })}
            </tbody>
         </table>
      </div>
    </div>
  );
}
