/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import { Mail, Phone, Calendar, CheckCircle, XCircle, Search, Clock, DollarSign } from 'lucide-react';
import db from '@/lib/db';
import { updateBookingStatus } from '@/lib/adminActions';

export const dynamic = 'force-dynamic';

export default async function AdminBookings() {
  // Mark all new bookings as viewed when this page is opened
  await db.prepare("UPDATE bookings SET status = 'Ko''rib chiqilmoqda' WHERE status = 'Yangi' AND apartment_id IS NOT NULL").run();

  // Fetch actual bookings from DB
  const bookings = await db.prepare(`
    SELECT b.*, a.number as apartment_number, p.name_uz as project_name 
    FROM bookings b
    JOIN apartments a ON b.apartment_id = a.id
    JOIN projects p ON a.project_id = p.id
    ORDER BY b.created_at DESC
  `).all() as any[];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Bronlar boshqaruvi</h1>
            <p className="text-gray-400">Kelib tushgan yangi bronlarni ko'rib chiqing va tasdiqlang.</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Mijoz</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Xonadon</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Sana</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Holati</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Xabar</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right">Amallar</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {bookings.length > 0 ? bookings.map((bron) => {
                 const phone = bron.client_phone || '';
                 const maskedPhone = bron.status === 'Tasdiqlangan' ? phone : (phone.length > 5 ? phone.slice(0, -4) + '** **' : phone);
                 
                 return (
                  <tr key={bron.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-8 py-6">
                        <div>
                           <div className="font-bold text-primary">{bron.client_name}</div>
                           <a href={`tel:${phone}`} className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-accent transition-colors">
                              <Phone size={10} /> {maskedPhone}
                           </a>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div>
                           <div className="text-sm font-bold text-primary">№ {bron.apartment_number}</div>
                           <div className="text-[10px] text-gray-400">{bron.project_name}</div>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                        {new Date(bron.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false })}
                     </td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase ${
                          bron.status === 'Tasdiqlangan' ? 'bg-success/10 text-success' : 
                          bron.status === 'Yangi' ? 'bg-primary/10 text-primary' : 
                          bron.status === "Ko'rib chiqilmoqda" ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                        }`}>{bron.status === 'Tasdiqlangan' ? 'BRON QILINDI' : bron.status}</span>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-xs text-gray-500 max-w-[200px] truncate" title={bron.note || "Xabar yo'q"}>
                           {bron.note ? bron.note : <span className="italic text-gray-300">Yo'q</span>}
                        </p>
                     </td>
                     <td className="px-8 py-6 text-right">
                        {bron.status === "Ko'rib chiqilmoqda" || bron.status === 'Yangi' ? (
                          <div className="flex items-center justify-end gap-2">
                             <form action={updateBookingStatus}>
                                <input type="hidden" name="id" value={bron.id} />
                                <input type="hidden" name="status" value="Tasdiqlangan" />
                                <button type="submit" className="p-2 text-success hover:bg-success/5 rounded-lg transition-all" title="Tasdiqlash (Bron qilish)">
                                   <CheckCircle size={18} />
                                </button>
                             </form>
                             <form action={updateBookingStatus}>
                                <input type="hidden" name="id" value={bron.id} />
                                <input type="hidden" name="status" value="Bekor qilingan" />
                                <button type="submit" className="p-2 text-danger hover:bg-danger/5 rounded-lg transition-all" title="Bekor qilish">
                                   <XCircle size={18} />
                                </button>
                             </form>
                          </div>
                        ) : bron.status === 'Tasdiqlangan' ? (
                          <div className="flex items-center justify-end gap-2">
                             <form action={updateBookingStatus}>
                                <input type="hidden" name="id" value={bron.id} />
                                <input type="hidden" name="status" value="Bekor qilingan" />
                                <button type="submit" className="p-2 text-danger hover:bg-danger/5 rounded-lg transition-all" title="Bekor qilish">
                                   <XCircle size={18} />
                                </button>
                             </form>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Bajarilgan</span>
                        )}
                     </td>
                  </tr>
               )
               }) : (
                 <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-300 font-medium">
                       <Clock size={48} className="mx-auto mb-4 opacity-20" />
                       Hozircha bronlar mavjud emas
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
