 
 
 
/* eslint-disable @next/next/no-img-element */
 
import React from 'react';
import { Globe, Save, Bot } from 'lucide-react';
import db from '@/lib/db';
import { saveSettings } from '@/lib/adminActions';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export default async function AdminSettings() {
  const settingsRows = await db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);

  return (
    <div className="max-w-4xl space-y-10">
    <form action={saveSettings} className="space-y-10">
      <div>
         <h1 className="text-3xl font-bold text-primary mb-2">Sozlamalar</h1>
         <p className="text-gray-400">Saytning global sozlamalari va integratsiyalarni boshqarish.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {/* SEO & Global */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">SEO & Umumiy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Kompaniya nomi</label>
                  <input name="company_name" type="text" defaultValue={settings.company_name || "Qurilish Premium"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Kompaniya logotipi</label>
                  <div className="flex items-center gap-4">
                    {settings.company_logo && (
                      <img src={settings.company_logo} alt="Logo" className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-100" />
                    )}
                    <input name="company_logo" type="file" accept="image/*" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Meta Title (UZ)</label>
                  <input name="meta_title_uz" type="text" defaultValue={settings.meta_title_uz || "Premium xonadonlar Xorazmda"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Asosiy rang (Primary)</label>
                  <input name="primary_color" type="color" defaultValue={settings.primary_color || "#014242"} className="w-full h-12 px-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white cursor-pointer" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Qo‘shimcha rang (Accent)</label>
                  <input name="accent_color" type="color" defaultValue={settings.accent_color || "#D18E5B"} className="w-full h-12 px-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white cursor-pointer" />
               </div>
               <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Meta Description</label>
                  <textarea name="meta_description" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" defaultValue={settings.meta_description || "Xorazmdagi eng yaxshi yangi qurilgan uylar..."} />
               </div>
            </div>
         </div>

         {/* Website Texts */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Sayt Matnlari</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Kirish qismi: Sarlavha</label>
                  <input name="hero_title" type="text" defaultValue={settings.hero_title || "Yangi hayotni biz bilan boshlang!"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Kirish qismi: Ta‘rif</label>
                  <textarea name="hero_desc" rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" defaultValue={settings.hero_desc || "Eng sifatli qurilish, qulay joylashuv va zamonaviy yechimlar. Orzuingizdagi xonadonlar aynan shu yerda."} />
               </div>
               <div className="col-span-2 border-t border-gray-100 my-4"></div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Biz haqimizda: Sarlavha (Katta qora yozuv)</label>
                  <input name="about_title" type="text" defaultValue={settings.about_title || "Zamonaviy va ishonchli qurilish"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Biz haqimizda: Asosiy matn</label>
                  <textarea name="about_desc" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" defaultValue={settings.about_desc || "Biz yillar tajribasi asosida O'zbekiston bozorida xalqaro standartlarga javob beruvchi yirik turar-joy majmualarini barpo etib kelmoqdamiz."} />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Statistika 1: Raqam</label>
                  <input name="about_stat1_value" type="text" defaultValue={settings.about_stat1_value || "15 yil"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Statistika 1: Nomi</label>
                  <input name="about_stat1_label" type="text" defaultValue={settings.about_stat1_label || "Tajriba"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Statistika 2: Raqam</label>
                  <input name="about_stat2_value" type="text" defaultValue={settings.about_stat2_value || "50+"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Statistika 2: Nomi</label>
                  <input name="about_stat2_label" type="text" defaultValue={settings.about_stat2_label || "Barpo etilgan loyihalar"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
            </div>
         </div>

         {/* Bosh ekran statistikasi */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Bosh ekran statistikasi</h3>
            </div>
            <p className="text-sm text-gray-400 mb-8">Bosh sahifadagi 4 ta raqam (masalan: <b>15 Yil</b> — <b>Tajriba</b>).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { v: 'hero_stat1_value', vd: '15 Yil', l: 'hero_stat1_label', ld: 'Tajriba' },
                 { v: 'hero_stat2_value', vd: '15+', l: 'hero_stat2_label', ld: 'Loyiha' },
                 { v: 'hero_stat3_value', vd: '5000+', l: 'hero_stat3_label', ld: 'Mijoz' },
                 { v: 'hero_stat4_value', vd: 'A\'lo', l: 'hero_stat4_label', ld: 'Sifat' },
               ].map((s, i) => (
                 <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-1">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Raqam {i + 1}</label>
                       <input name={s.v} type="text" defaultValue={settings[s.v] || s.vd} className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Nomi</label>
                       <input name={s.l} type="text" defaultValue={settings[s.l] || s.ld} className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Biz haqimizda — afzalliklar */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Biz haqimizda — afzalliklar</h3>
            </div>
            <p className="text-sm text-gray-400 mb-8">&quot;Biz haqimizda&quot; bo‘limidagi 4 ta afzallik kartasi (sarlavha + tavsif).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { t: 'about_adv1_title', td: 'Xalqaro sifat', d: 'about_adv1_desc', dd: 'Zamonaviy texnologiya va materiallar' },
                 { t: 'about_adv2_title', td: 'Kafolat', d: 'about_adv2_desc', dd: 'Har bir loyihaga to‘liq kafolat' },
                 { t: 'about_adv3_title', td: 'O‘z vaqtida', d: 'about_adv3_desc', dd: 'Belgilangan muddatda topshirish' },
                 { t: 'about_adv4_title', td: 'Qulay to‘lov', d: 'about_adv4_desc', dd: 'Muddatli va ipoteka imkoniyati' },
               ].map((a, i) => (
                 <div key={i} className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Karta {i + 1}</label>
                    <input name={a.t} type="text" defaultValue={settings[a.t] || a.td} placeholder="Sarlavha" className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold outline-none focus:border-primary" />
                    <input name={a.d} type="text" defaultValue={settings[a.d] || a.dd} placeholder="Tavsif" className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none focus:border-primary" />
                 </div>
               ))}
            </div>
         </div>

         {/* Aloqa ma'lumotlari */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Aloqa ma‘lumotlari</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Telefon raqami</label>
                  <input name="contact_phone" type="text" defaultValue={settings.contact_phone || "+998 91 011 66 66"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                  <p className="text-[11px] text-gray-400">Aloqa va sotuv ofisi bo‘limlarida ko‘rinadi.</p>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Ish vaqti</label>
                  <input name="contact_hours" type="text" defaultValue={settings.contact_hours || "Har kuni 09:00 dan 18:00 gacha"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Manzil</label>
                  <input name="contact_address" type="text" defaultValue={settings.contact_address || "Xorazm viloyati, Urganch sh., Ulug‘bek ko‘chasi"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Xarita — Kenglik (lat)</label>
                  <input name="office_lat" type="text" defaultValue={settings.office_lat || "41.544716"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Xarita — Uzunlik (lng)</label>
                  <input name="office_lng" type="text" defaultValue={settings.office_lng || "60.599816"} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                  <p className="text-[11px] text-gray-400">Yandex/Google xaritadan koordinatani nusxalab qo‘ying.</p>
               </div>
            </div>
         </div>

         {/* Integrations */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <Globe className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Sayt bo‘limlari (Yoqish / O‘chirish)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {[
                 { id: 'show_projects', label: 'Loyihalar ro\'yxati' },
                 { id: 'show_search', label: 'Xonadon qidiruvi (filtr)' },
                 { id: 'show_mortgage', label: 'Ipoteka kalkulyatori' },
                 { id: 'show_about', label: 'Biz haqimizda' },
                 { id: 'show_news', label: 'Yangiliklar' },
                 { id: 'show_offices', label: 'Sotuv ofisi (xarita)' },
                 { id: 'show_contact', label: 'Aloqa bo\'limi' },
               ].map(item => (
                 <div key={item.id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="text-sm font-bold text-gray-700 flex justify-between items-center cursor-pointer">
                      {item.label}
                      <input 
                         type="checkbox" 
                         name={item.id} 
                         value="true" 
                         defaultChecked={settings[item.id] !== 'false'} 
                         className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </label>
                 </div>
               ))}
            </div>
         </div>

         {/* Integrations */}
         <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <Bot className="text-accent" />
               <h3 className="font-bold text-xl text-primary">Telegram Integratsiyasi</h3>
            </div>
            <div className="space-y-6">
               <div className="p-4 bg-primary/5 rounded-2xl flex gap-4 items-center">
                  <InfoIcon className="text-primary shrink-0" size={24} />
                  <p className="text-sm text-primary/60">Yangi bronlar haqida Telegram orqali bildirishnoma olish uchun bot tokeningizni kiriting.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Bot Token</label>
                     <input name="bot_token" type="password" defaultValue={settings.bot_token || ""} placeholder="123456:ABC-DEF..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Admin Chat ID</label>
                     <input name="admin_chat_id" type="text" defaultValue={settings.admin_chat_id || ""} placeholder="12345678" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="flex justify-end">
         <button type="submit" className="px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3 transform hover:scale-105 transition-all">
            <Save size={20} />
            O&apos;zgarishlarni saqlash
         </button>
      </div>
    </form>

    <ChangePasswordForm />
    </div>
  );
}

function InfoIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
