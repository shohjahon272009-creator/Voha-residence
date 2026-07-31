 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { deleteNews, updateNews } from '@/lib/adminActions';

 
export default function NewsRowActions({ item }: { item: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(item.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(item.image);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateNews(item.id, formData);
    setLoading(false);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (confirm('Rostdan ham ushbu yangilikni o&apos;chirmoqchimisiz?')) {
      await deleteNews(item.id);
    }
  };

  return (
    <>
      <button onClick={() => setIsEditOpen(true)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all" title="Tahrirlash">
         <Edit2 size={16} />
      </button>
      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all" title="O'chirish">
         <Trash2 size={16} />
      </button>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-primary">Yangilikni tahrirlash</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sarlavha (UZ) *</label>
                  <input name="title_uz" type="text" defaultValue={item.title_uz} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sarlavha (RU)</label>
                  <input name="title_ru" type="text" defaultValue={item.title_ru} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sarlavha (EN)</label>
                  <input name="title_en" type="text" defaultValue={item.title_en} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rasm (Ixtiyoriy, o&apos;zgartirish uchun yuklang)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategoriya</label>
                <input name="category" type="text" defaultValue={item.category} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matn (UZ) *</label>
                <textarea name="content_uz" defaultValue={item.content_uz} required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matn (RU)</label>
                <textarea name="content_ru" defaultValue={item.content_ru} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matn (EN)</label>
                <textarea name="content_en" defaultValue={item.content_en} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
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
