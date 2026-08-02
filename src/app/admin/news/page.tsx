/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import db from '@/lib/db';
import { Newspaper, Edit2, Trash2 } from 'lucide-react';
import AddNewsModal from './AddNewsModal';
import NewsRowActions from './NewsRowActions';

export const dynamic = 'force-dynamic';

export default async function AdminNews() {
  const news = await db.prepare('SELECT * FROM news ORDER BY date DESC').all() as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Yangiliklar</h1>
            <p className="text-gray-400">Kompaniya va loyihalar bo'yicha so'nggi yangiliklar.</p>
         </div>
         
         <AddNewsModal />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <table className="w-full text-left">
            <thead>
               <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-4 font-medium">Sarlavha (UZ)</th>
                  <th className="pb-4 font-medium">Sana</th>
                  <th className="pb-4 font-medium">Holat</th>
                  <th className="pb-4 font-medium text-right">Amallar</th>
               </tr>
            </thead>
            <tbody>
               {news.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-gray-400">Hozircha yangiliklar yo'q</td>
                 </tr>
               ) : (
                 news.map((item, i) => (
                   <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-primary flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary overflow-hidden">
                            {item.image ? (
                               <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                               <Newspaper size={16} />
                            )}
                         </div>
                         {item.title_uz}
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                         {new Date(item.date).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-4">
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${item.visible ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                            {item.visible ? 'Faol' : 'Yashiringan'}
                         </span>
                      </td>
                      <td className="py-4 text-right">
                         <div className="flex items-center justify-end gap-1">
                            <NewsRowActions item={item} />
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
