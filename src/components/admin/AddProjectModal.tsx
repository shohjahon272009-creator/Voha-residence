 
 
 
 
 
'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addProject } from '@/lib/adminActions';
import { translateText } from '@/lib/translateAction';
import { CATEGORIES } from '@/lib/categories';
import PasteImageInput from './PasteImageInput';

export default function AddProjectModal({ isSoldOut }: { isSoldOut?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [status, setStatus] = useState('Jarayonda');

  const [names, setNames] = useState({ uz: '', ru: '', en: '' });
  const [descs, setDescs] = useState({ uz: '', ru: '', en: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addProject(formData);
    setLoading(false);
    setIsOpen(false);
    // reset form
    setNames({ uz: '', ru: '', en: '' });
    setDescs({ uz: '', ru: '', en: '' });
    setStatus('Jarayonda');
  };

  const handleNameBlur = async (lang: 'uz'|'ru'|'en') => {
    const text = names[lang];
    if (!text) return;
    setTranslating(true);
    const langs = ['uz', 'ru', 'en'] as const;
    const newNames = { ...names };
    for (const target of langs) {
      if (target !== lang && !newNames[target]) {
        newNames[target] = await translateText(text, lang, target);
      }
    }
    setNames(newNames);
    setTranslating(false);
  };

  const handleDescBlur = async (lang: 'uz'|'ru'|'en') => {
    const text = descs[lang];
    if (!text) return;
    setTranslating(true);
    const langs = ['uz', 'ru', 'en'] as const;
    const newDescs = { ...descs };
    for (const target of langs) {
      if (target !== lang && !newDescs[target]) {
        newDescs[target] = await translateText(text, lang, target);
      }
    }
    setDescs(newDescs);
    setTranslating(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 text-sm"
      >
        Yangi loyiha qo&apos;shish
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-primary">Yangi loyiha qo&apos;shish</h2>
                {translating && <span className="text-xs font-bold text-accent flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Tarjima qilinmoqda...</span>}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nomi (UZ)</label>
                  <input required name="name_uz" type="text" value={names.uz} onChange={e => setNames({...names, uz: e.target.value})} onBlur={() => handleNameBlur('uz')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nomi (RU)</label>
                  <input required name="name_ru" type="text" value={names.ru} onChange={e => setNames({...names, ru: e.target.value})} onBlur={() => handleNameBlur('ru')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nomi (EN)</label>
                  <input required name="name_en" type="text" value={names.en} onChange={e => setNames({...names, en: e.target.value})} onBlur={() => handleNameBlur('en')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Shahar</label>
                  <input required name="city" type="text" defaultValue="Xorazm" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tuman</label>
                  <input required name="district" type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                     {isSoldOut ? (
                        <>
                           <input type="hidden" name="status" value="Topshirilgan" />
                           <input type="hidden" name="is_sold_out" value="true" />
                        </>
                     ) : (
                       <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">Holati</label>
                          <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm">
                             <option value="Jarayonda">Jarayonda</option>
                             <option value="Tez kunda">Tez kunda</option>
                             <option value="Sanoqli kunlar qoldi">Sanoqli kunlar qoldi</option>
                             <option value="Topshirilgan">Topshirilgan</option>
                          </select>
                       </div>
                     )}
                     {status === 'Sanoqli kunlar qoldi' && (
                       <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">Qolgan kunlar</label>
                          <input name="days_left" type="number" required min={1} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm" />
                       </div>
                     )}
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">Qavatlar soni</label>
                        <input name="total_floors" type="number" required min={1} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">Qavatdagi xonadonlar</label>
                        <input name="apts_per_floor" type="number" required min={1} defaultValue={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white text-sm" />
                     </div>
                  </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <PasteImageInput name="main_image" label="Loyiha Asosiy Rasmi" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Qo&apos;shimcha rasmlar / galereya <span className="text-gray-300 font-normal">— ixtiyoriy</span></label>
                  <input type="file" name="gallery_images" accept="image/*" multiple className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer" />
                  <p className="text-[11px] text-gray-400 mt-1">Bir nechta rasm birdaniga tanlashingiz mumkin. Loyiha sahifasida galereya bo&apos;lib chiqadi.</p>
                </div>
                <div className="col-span-2 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-600">🌐 360° Virtual Tur (ixtiyoriy)</label>
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Panorama rasm yuklash</span>
                    <input type="file" name="virtual_tour_image" accept="image/*" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer" />
                    <p className="text-[11px] text-gray-400 mt-1">360° (panorama / equirectangular) rasm yuklang — foydalanuvchi uni aylantirib ko&apos;radi.</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-300">
                    <span className="h-px bg-gray-200 flex-1" /> YOKI <span className="h-px bg-gray-200 flex-1" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tashqi tur havolasi</span>
                    <input type="url" name="virtual_tour_url" placeholder="https://... (atlasvr, kuula, momento360 va h.k.)" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">🏷️ Chegirma belgisi <span className="text-gray-300 font-normal">— ixtiyoriy</span></label>
                    <input name="discount_label" placeholder="Masalan: Chegirma 50 mln gacha" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">🎁 Sovg&apos;a belgisi <span className="text-gray-300 font-normal">— ixtiyoriy</span></label>
                    <input name="gift_label" placeholder="Masalan: Ta'mir sovg'a" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">📅 Topshirish yili <span className="text-gray-300 font-normal">— ixtiyoriy</span></label>
                    <input name="delivery_year" type="number" min={2024} max={2035} placeholder="Masalan: 2027" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">📍 Joylashuv kategoriyalari (saytda ko&apos;rinadi)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2 cursor-pointer hover:border-primary">
                        <input type="checkbox" name="categories" value={c.key} className="w-4 h-4 accent-primary" />
                        <span>{c.emoji} {c.label.uz}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ta&apos;rifi (UZ)</label>
                  <textarea name="description_uz" rows={3} value={descs.uz} onChange={e => setDescs({...descs, uz: e.target.value})} onBlur={() => handleDescBlur('uz')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ta&apos;rifi (RU)</label>
                  <textarea name="description_ru" rows={3} value={descs.ru} onChange={e => setDescs({...descs, ru: e.target.value})} onBlur={() => handleDescBlur('ru')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ta&apos;rifi (EN)</label>
                  <textarea name="description_en" rows={3} value={descs.en} onChange={e => setDescs({...descs, en: e.target.value})} onBlur={() => handleDescBlur('en')} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading || translating} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
