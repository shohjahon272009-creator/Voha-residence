/* eslint-disable react/no-unescaped-entities */
 
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { addNews } from '@/lib/adminActions';

export default function AddNewsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addNews(formData);
    setLoading(false);
    setIsOpen(false);
    setPreview(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-accent transition-all"
      >
        <Plus size={20} /> Yangilik qo'shish
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-primary">Yangi yangilik qo'shish</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sarlavha (UZ) *</label>
                  <input name="title_uz" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rasm *</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 text-gray-500 overflow-hidden">
                      {preview ? (
                        <div className="flex items-center gap-2">
                           <img src={preview} className="w-6 h-6 object-cover rounded" alt="Preview" />
                           <span className="text-xs truncate">Tanlandi</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} />
                          <span>Rasm yuklash</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matn (UZ) *</label>
                <textarea name="content_uz" required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-accent transition-all disabled:opacity-50">
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
