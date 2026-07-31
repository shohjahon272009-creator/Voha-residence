 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import React from 'react';
import db from '@/lib/db';
import { Phone, CalendarClock, DollarSign } from 'lucide-react';
import AddSaleModal from '@/components/admin/AddSaleModal';
import { getProjects, getApartments } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default function AdminSales() {
  const projects = getProjects();
  const apartments = getApartments();

  const sales = db.prepare(`
    SELECT a.id as apt_id, a.number as apartment_number, a.price_cash, p.name_uz as project_name,
           b.id as booking_id, b.client_name, b.client_phone, b.created_at
    FROM apartments a
    JOIN projects p ON a.project_id = p.id
    LEFT JOIN bookings b ON b.apartment_id = a.id AND b.status = 'Tasdiqlangan'
    WHERE a.status = 'Band'
    ORDER BY COALESCE(b.created_at, '2000-01-01') DESC
  `).all() as any[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Sotilgan xonadonlar (Band)</h1>
            <p className="text-gray-400">To&apos;liq sotilgan va band qilingan barcha xonadonlar hamda xaridorlar ro&apos;yxati.</p>
         </div>
         <AddSaleModal projects={projects} apartments={apartments} />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <table className="w-full text-left">
            <thead>
               <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-4 font-medium">Xaridor F.I.O</th>
                  <th className="pb-4 font-medium">Telefon raqam</th>
                  <th className="pb-4 font-medium">Xarid qilingan xonadon</th>
                  <th className="pb-4 font-medium text-right">Sana</th>
               </tr>
            </thead>
            <tbody>
               {sales.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-gray-400">Hozircha sotilgan xonadonlar yo&apos;q</td>
                 </tr>
               ) : (
                 sales.map((sale) => (
                   <tr key={sale.apt_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-primary flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign size={16} />
                         </div>
                         {sale.client_name || <span className="text-gray-400 font-normal italic">Kiritilmagan</span>}
                      </td>
                      <td className="py-4">
                         {sale.client_phone ? (
                           <a href={`tel:${sale.client_phone}`} className="flex items-center gap-2 font-bold text-gray-700 hover:text-accent">
                              <Phone size={14} className="text-gray-400" /> {sale.client_phone}
                           </a>
                         ) : (
                           <span className="text-gray-400 italic text-sm">-</span>
                         )}
                      </td>
                      <td className="py-4 max-w-xs text-sm text-gray-500">
                         <div className="font-bold text-primary">
                           {sale.project_name}, №{sale.apartment_number} xonadon
                         </div>
                         <div className="text-xs text-gray-400 mt-1">
                           Narxi: {(sale.price_cash / 1000000).toLocaleString()} mln UZS
                         </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-500">
                         <div className="flex items-center justify-end gap-1.5">
                           <CalendarClock size={14} />
                           {sale.created_at ? new Date(sale.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false }) : <span className="text-gray-400">-</span>}
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
