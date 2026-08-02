/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import React from 'react';
import db from '@/lib/db';
import { MessageSquare, Phone, CalendarClock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInquiries() {
  // Mark all new inquiries as viewed when this page is opened
  await db.prepare("UPDATE bookings SET status = 'Ko''rib chiqilmoqda' WHERE status = 'Yangi' AND apartment_id IS NULL").run();

  const messages = await db.prepare("SELECT * FROM bookings WHERE apartment_id IS NULL ORDER BY created_at DESC").all() as any[];

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold text-primary mb-2">Mijozlar murojaati</h1>
         <p className="text-gray-400">Saytdagi "Biz bilan bog'lanish" formasi orqali kelgan barcha savol va murojaatlar ro'yxati.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <table className="w-full text-left">
            <thead>
               <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-4 font-medium">Mijoz F.I.O</th>
                  <th className="pb-4 font-medium">Telefon raqam</th>
                  <th className="pb-4 font-medium">Xabar mazmuni</th>
                  <th className="pb-4 font-medium text-right">Sana</th>
               </tr>
            </thead>
            <tbody>
               {messages.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-gray-400">Hozircha murojaatlar yo'q</td>
                 </tr>
               ) : (
                 messages.map((m) => (
                   <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-primary flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                            <MessageSquare size={16} />
                         </div>
                         {m.client_name}
                      </td>
                      <td className="py-4">
                         <a href={`tel:${m.client_phone}`} className="flex items-center gap-2 font-bold text-gray-700 hover:text-accent">
                            <Phone size={14} className="text-gray-400" /> {m.client_phone}
                         </a>
                      </td>
                      <td className="py-4 max-w-xs text-sm text-gray-500">
                         {m.note ? m.note : <span className="italic text-gray-300">Xabar matni yo'q</span>}
                      </td>
                      <td className="py-4 text-right text-sm text-gray-500">
                         <div className="flex items-center justify-end gap-1.5">
                           <CalendarClock size={14} />
                           {new Date(m.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false })}
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
