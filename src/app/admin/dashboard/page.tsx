/* eslint-disable react/no-unescaped-entities */
 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import { Plus, Edit2, Trash2, MapPin, Eye, Building2, CheckCircle, AlertCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { getProjects, getApartments, getApartmentStats } from '@/lib/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const stats = getApartmentStats();
  const projects = getProjects();
  const allApts = getApartments();

  const statCards = [
    { label: 'Jami xonadonlar', value: stats.total, icon: Building2, color: 'text-primary', bg: 'bg-primary/10', href: '/admin/apartments' },
    { label: "Bo'sh", value: stats.available, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', href: '/admin/apartments' },
    { label: 'Band', value: stats.sold, icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10', href: '/admin/sales' },
    { label: 'Bronlangan', value: stats.booked, icon: Clock, color: 'text-warning', bg: 'bg-warning/10', href: '/admin/booked' },
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Projects Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-xl text-primary">Loyihalar</h3>
             <Link href="/admin/projects" className="text-sm font-bold text-accent flex items-center gap-1 hover:underline">
                Hammasini ko'rish <ArrowUpRight size={14} />
             </Link>
          </div>
          <div className="space-y-4">
             {projects.map(p => {
               const apts = allApts.filter(a => a.project_id === p.id);
               const available = apts.filter(a => a.status === "Bo'sh").length;
               return (
                 <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                          <Building2 size={20} className="text-primary" />
                       </div>
                       <div>
                          <div className="font-bold text-sm text-primary">{p.name_uz}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                             <MapPin size={9} /> {p.district}, {p.city}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-bold text-primary">{available} bo'sh / {apts.length} jami</div>
                       <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                         p.status === 'Jarayonda' ? 'bg-blue-50 text-blue-500' :
                         p.status === 'Topshirilgan' ? 'bg-success/10 text-success' : 'bg-amber-50 text-amber-500'
                       }`}>{p.status}</span>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Apartment status mini grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-xl text-primary mb-8">Xonadonlar holati</h3>
          <div className="space-y-6">
            {[
              { label: "Bo'sh", count: stats.available, total: stats.total, color: 'bg-success' },
              { label: 'Band', count: stats.sold, total: stats.total, color: 'bg-danger' },
              { label: 'Bronlangan', count: stats.booked, total: stats.total, color: 'bg-warning' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm font-bold text-primary mb-2">
                  <span>{item.label}</span>
                  <span>{item.count} ta</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <div className="text-sm text-gray-400 font-medium mb-1">Umumiy to'lganlik</div>
            <div className="text-4xl font-bold text-primary">
              {stats.total > 0 ? Math.round(((stats.sold + stats.booked) / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
