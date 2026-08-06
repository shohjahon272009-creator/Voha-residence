'use client';

import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { addApartment } from '@/lib/adminActions';
import PasteImageInput from './PasteImageInput';

export default function AddApartmentModal({ projectId, projectName }: { projectId: number; projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set('project_id', String(projectId));
      await addApartment(formData);
      setIsOpen(false);
    } catch {
      alert("Saqlab bo'lmadi. Bir oz kutib, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-xs hover:bg-primary hover:text-white transition-all"
      >
        <Plus size={15} /> Xonadon qo&apos;shish
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-primary">Yangi xonadon</h2>
                <p className="text-xs text-gray-400">{projectName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex gap-2.5 items-start p-3 bg-primary/5 rounded-xl text-[12px] text-primary/70 leading-relaxed">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <span>Joylashuv (Suv bo&apos;yida, Maktab yonida, ...) <b>{projectName}</b> loyihasi sozlamalarida belgilanadi — bu xonadon o&apos;sha joylashuvni avtomatik oladi.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Qavat</label>
                  <input name="floor" type="number" min={1} required defaultValue={1} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Xonadon raqami</label>
                  <input name="number" type="text" placeholder="101" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Xonalar soni</label>
                  <select name="rooms" defaultValue={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white">
                    <option value={1}>1 xona</option>
                    <option value={2}>2 xona</option>
                    <option value={3}>3 xona</option>
                    <option value={4}>4 xona</option>
                    <option value={5}>5 xona</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Maydon (m²)</label>
                  <input name="area" type="number" step="any" min={0} required placeholder="55" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Narxi (UZS) <span className="text-gray-300 font-normal">— to‘lov kalkulyatori uchun</span></label>
                <input name="price_cash" type="number" min={0} step="any" placeholder="800000000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                <p className="text-[11px] text-gray-400 mt-1">Mijozga narx ochiq ko&apos;rsatilmaydi — faqat oylik to&apos;lov hisoblanadi.</p>
              </div>

              <PasteImageInput name="plan_image" label="Chizma (plan) rasmi — ixtiyoriy" />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Bekor qilish</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                  {loading ? 'Saqlanmoqda...' : 'Qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
