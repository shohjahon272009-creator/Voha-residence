/* eslint-disable react/no-unescaped-entities */
 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import { Plus, Edit2, Trash2, MapPin, Eye, Building2, CheckCircle, AlertCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { getProjects, getApartments, getApartmentStats } from '@/lib/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getApartmentStats();
  const projects = await getProjects();
  const allApts = await getApartments();

  const statCards = [
    { label: 'Jami loyihalar', value: projects.length, icon: Building2, color: 'text-primary', bg: 'bg-primary/10', href: '/admin/projects' },
    { label: 'Jami xonadonlar', value: stats.total, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', href: '/admin/apartments' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Bosh sahifa</h1>
            <p className="text-gray-400 text-sm">Xush kelibsiz! Bugungi statistika bilan tanishing.</p>
         </div>
         <div className="flex gap-3">
            <Link href="/admin/projects" className="px-5 py-2.5 bg-white border border-gray-200 text-primary font-bold rounded-xl flex items-center gap-2 text-sm hover:border-primary transition-all">
               <Plus size={18} /> Loyiha
            </Link>
            <a href="/api/export" download className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 text-sm hover:bg-accent transition-all">
               <TrendingUp size={18} /> Hisobot
            </a>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
         {statCards.map((card, i) => (
           <Link href={card.href} key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                 <card.icon size={28} className={card.color} />
              </div>
              <div>
                 <div className="text-gray-400 text-xs font-medium mb-1">{card.label}</div>
                 <div className="text-3xl font-bold text-primary">{card.value}</div>
              </div>
           </Link>
         ))}
      </div>

      {/* Loyihalar jadvali — to'liq kenglikda, toza */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="font-bold text-xl text-primary">Loyihalar</h3>
           <Link href="/admin/projects" className="text-sm font-bold text-accent flex items-center gap-1 hover:underline">
              Hammasini ko'rish <ArrowUpRight size={14} />
           </Link>
        </div>
        <div className="space-y-1">
           {projects.map(p => {
             const apts = allApts.filter(a => a.project_id === p.id);
             return (
               <Link href="/admin/apartments" key={p.id} className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                     <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 size={20} className="text-primary" />
                     </div>
                     <div className="min-w-0">
                        <div className="font-bold text-sm text-primary truncate">{p.name_uz}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                           <MapPin size={9} /> {p.district}, {p.city}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <span className="text-xs font-bold text-primary">{apts.length} xonadon</span>
                     <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                       p.status === 'Jarayonda' ? 'bg-blue-50 text-blue-500' :
                       p.status === 'Topshirilgan' ? 'bg-success/10 text-success' : 'bg-amber-50 text-amber-500'
                     }`}>{p.status}</span>
                  </div>
               </Link>
             );
           })}
        </div>
      </div>
    </div>
  );
}
