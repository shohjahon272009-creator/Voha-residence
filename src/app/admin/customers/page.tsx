/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import React from 'react';
import db from '@/lib/db';
import { Building2, Phone, CalendarClock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminCustomers() {
  const clients = db.prepare(`
    SELECT b.*, a.number as apartment_number, p.name_uz as project_name 
    FROM bookings b
    JOIN apartments a ON b.apartment_id = a.id
    JOIN projects p ON a.project_id = p.id
    ORDER BY b.created_at DESC
  `).all() as any[];

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold text-primary mb-2">Mijozlar</h1>
         <p className="text-gray-400">Xonadon bron qilgan barcha mijozlar ro'yxati.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <table className="w-full text-left">
            <thead>
               <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-4 font-medium">Mijoz F.I.O</th>
                  <th className="pb-4 font-medium">Telefon raqam</th>
                  <th className="pb-4 font-medium">Bron qilingan xonadon</th>
                  <th className="pb-4 font-medium text-right">Sana</th>
               </tr>
            </thead>
            <tbody>
               {clients.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-gray-400">Hozircha mijozlar yo'q</td>
                 </tr>
               ) : (
                 clients.map((c) => (
                   <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-primary flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                            <Building2 size={16} />
                         </div>
                         {c.client_name}
                      </td>
                      <td className="py-4">
                         <a href={`tel:${c.client_phone}`} className="flex items-center gap-2 font-bold text-gray-700 hover:text-accent">
                            <Phone size={14} className="text-gray-400" /> {c.client_phone}
                         </a>
                      </td>
                      <td className="py-4 max-w-xs text-sm text-gray-500">
                         <div className="font-bold text-success">
                           {c.project_name}, №{c.apartment_number} xonadon
                           {c.note && <span className="block font-normal text-gray-500 mt-1">{c.note}</span>}
                         </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-500">
                         <div className="flex items-center justify-end gap-1.5">
                           <CalendarClock size={14} />
                           {new Date(c.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false })}
                         </div>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
