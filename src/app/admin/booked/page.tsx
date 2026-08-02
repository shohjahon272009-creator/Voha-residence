/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import db from '@/lib/db';
import { Building2, Phone, CalendarClock, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBooked() {
  const booked = await db.prepare(`
    SELECT a.id as apt_id, a.number as apartment_number, a.price_cash, p.name_uz as project_name,
           b.id as booking_id, b.client_name, b.client_phone, b.created_at
    FROM apartments a
    JOIN projects p ON a.project_id = p.id
    LEFT JOIN bookings b ON b.apartment_id = a.id AND b.status = 'Tasdiqlangan'
    WHERE a.status = 'Bronlangan'
    ORDER BY COALESCE(b.created_at, '2000-01-01') DESC
  `).all() as any[];

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold text-primary mb-2">Bron qilingan xonadonlar</h1>
         <p className="text-gray-400">Hozirda band qilib qo'yilgan (sotilishi kutilayotgan) xonadonlar va mijozlar ro'yxati.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <table className="w-full text-left">
            <thead>
               <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-4 font-medium">Xaridor F.I.O</th>
                  <th className="pb-4 font-medium">Telefon raqam</th>
                  <th className="pb-4 font-medium">Bron qilingan xonadon</th>
                  <th className="pb-4 font-medium text-right">Sana</th>
               </tr>
            </thead>
            <tbody>
               {booked.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-gray-400">Hozircha bron qilingan xonadonlar yo'q</td>
                 </tr>
               ) : (
                 booked.map((book) => (
                   <tr key={book.apt_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-primary flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                            <Clock size={16} />
                         </div>
                         {book.client_name || <span className="text-gray-400 font-normal italic">Kiritilmagan</span>}
                      </td>
                      <td className="py-4">
                         {book.client_phone ? (
                           <a href={`tel:${book.client_phone}`} className="flex items-center gap-2 font-bold text-gray-700 hover:text-accent">
                              <Phone size={14} className="text-gray-400" /> {book.client_phone}
                           </a>
                         ) : (
                           <span className="text-gray-400 italic text-sm">-</span>
                         )}
                      </td>
                      <td className="py-4 max-w-xs text-sm text-gray-500">
                         <div className="font-bold text-primary">
                           {book.project_name}, №{book.apartment_number} xonadon
                         </div>
                         <div className="text-xs text-gray-400 mt-1">
                           Narxi: {(book.price_cash / 1000000).toLocaleString()} mln UZS
                         </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-500">
                         <div className="flex items-center justify-end gap-1.5">
                           <CalendarClock size={14} />
                           {book.created_at ? new Date(book.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false }) : <span className="text-gray-400">-</span>}
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
