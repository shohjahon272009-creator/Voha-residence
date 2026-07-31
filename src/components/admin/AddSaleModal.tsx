 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { addSale } from '@/lib/adminActions';

 
export default function AddSaleModal({ projects, apartments }: { projects: any[], apartments: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addSale(formData);
    setLoading(false);
    setIsOpen(false);
  };

  const availableApartments = apartments.filter(a => 
    a.project_id.toString() === selectedProject && a.status === "Bo'sh"
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 text-sm hover:bg-accent hover:text-primary transition-all"
      >
        <Plus size={18} /> Yangi sotuv
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-primary">Yangi sotuv qo&apos;shish</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Loyiha (Obyekt)</label>
                <select 
                  required 
                  value={selectedProject} 
                  onChange={(e) => setSelectedProject(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary"
                >
                  <option value="">Loyihani tanlang...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name_uz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Bo&apos;sh xonadonlar</label>
                <select 
                  required 
                  name="apartment_id" 
                  disabled={!selectedProject}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary disabled:bg-gray-50 disabled:opacity-50"
                >
                  <option value="">Xonadonni tanlang...</option>
                  {availableApartments.map(a => (
                    <option key={a.id} value={a.id}>№{a.number} - {a.rooms} xona, {a.area}m²</option>
                  ))}
                </select>
                {selectedProject && availableApartments.length === 0 && (
                  <p className="text-xs text-danger mt-1">Bu loyihada bo&apos;sh xonadon qolmagan!</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Mijoz F.I.O</label>
                <input required name="client_name" type="text" placeholder="Ism familiya" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Telefon raqam</label>
                <input required name="client_phone" type="text" placeholder="+998" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-primary" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading || availableApartments.length === 0} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
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
