 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { updateApartment } from '@/lib/adminActions';
import PasteImageInput from './PasteImageInput';

 
export default function EditApartmentModal({ apt }: { apt: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateApartment(apt.id, formData);
    setLoading(false);
    setIsOpen(false);
  };

  // Xonadon holati endi ishlatilmaydi — barcha kartalar bir xil neytral ko'rinishda
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="w-full p-3 rounded-xl border border-gray-100 bg-white hover:border-primary hover:bg-primary/[0.03] cursor-pointer transition-all group relative"
      >
        <Edit2 size={12} className="absolute top-2.5 right-2.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-base font-black text-primary group-hover:text-accent transition-colors leading-none">№{apt.number}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span className="text-[11px] text-gray-400 font-medium">{apt.rooms} xona</span>
          <span className="text-xs font-bold text-accent whitespace-nowrap">{apt.area} m²</span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-primary">№{apt.number} xonadonni tahrirlash</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Qavat</label>
                  <input required name="floor" type="number" min="1" defaultValue={apt.floor} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Xonadon raqami</label>
                  <input name="number" type="text" defaultValue={apt.number} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Xonalar soni</label>
                  <input required name="rooms" type="number" min="1" defaultValue={apt.rooms} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Maydoni (m²)</label>
                  <input required name="area" type="number" step="any" min="1" defaultValue={apt.area} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Narxi (UZS)</label>
                <input required name="price_cash" type="number" min="0" defaultValue={apt.price_cash} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PasteImageInput name="plan_image" label="Xonadon chizmasi" existing={apt.plan_image} />
                <PasteImageInput name="image" label="Xonadon rasmi" existing={apt.image} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
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
