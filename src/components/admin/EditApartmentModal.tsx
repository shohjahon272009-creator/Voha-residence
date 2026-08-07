 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { updateApartment, deleteApartment } from '@/lib/adminActions';
import PasteImageInput from './PasteImageInput';


export default function EditApartmentModal({ apt }: { apt: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateApartment(apt.id, formData);
      setIsOpen(false);
    } catch {
      alert("Saqlab bo'lmadi. Bir oz kutib, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteApartment(apt.id);
    setDeleting(false);
    setConfirmDel(false);
    setIsOpen(false);
  };

  // Xonadon holati endi ishlatilmaydi — barcha kartalar bir xil neytral ko'rinishda
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="w-full p-4 rounded-2xl border border-gray-100 bg-white hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 cursor-pointer transition-all group relative"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-lg font-black text-primary group-hover:text-accent transition-colors leading-none">№{apt.number}</span>
          <Edit2 size={13} className="text-gray-300 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-500 font-medium">{apt.rooms} xona</span>
          <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-bold whitespace-nowrap">{apt.area} m²</span>
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

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                {confirmDel ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-500">{"O'chirilsinmi?"}</span>
                    <button type="button" onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50">
                      {deleting ? "O'chirilmoqda..." : "Ha, o'chir"}
                    </button>
                    <button type="button" onClick={() => setConfirmDel(false)} className="px-3 py-1.5 text-gray-500 text-xs font-bold hover:bg-gray-50 rounded-lg">
                      {"Yo'q"}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmDel(true)} className="flex items-center gap-1.5 px-3 py-2 text-red-500 text-xs font-bold hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} /> {"O'chirish"}
                  </button>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsOpen(false); setConfirmDel(false); }} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                    {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
