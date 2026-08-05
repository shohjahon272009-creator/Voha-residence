 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  const bgClass = "bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white";

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        title={`№${apt.number} | ${apt.rooms} xona | ${apt.area}m² | ${(apt.price_cash / 1000000).toFixed(0)} mln UZS`}
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer border-2 transition-all hover:scale-110 group relative ${bgClass}`}
      >
        {apt.number}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {apt.rooms}xona • {apt.area}m² • {(apt.price_cash/1000000).toFixed(0)}mln
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
