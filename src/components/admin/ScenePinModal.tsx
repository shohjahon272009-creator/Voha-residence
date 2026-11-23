'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Info } from 'lucide-react';
import { saveScenePin } from '@/lib/sceneActions';
import type { ScenePin } from '@/lib/scene';

type ProjectOption = { id: number; name_uz: string };

const input = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white';
const label = 'block text-xs font-bold text-gray-500 mb-1';

// Pin qo'shish (pin berilmasa) yoki tahrirlash oynasi
export default function ScenePinModal({ pin, projects }: { pin?: ScenePin; projects: ProjectOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData(e.currentTarget);
      if (pin) formData.set('id', String(pin.id));
      const res = await saveScenePin(formData);
      if (res.ok) setIsOpen(false);
      else setError(res.error);
    } catch {
      setError("Saqlab bölmadi. Bir oz kutib, qayta urinib köring.");
    } finally {
      setLoading(false);
    }
  };

  const coord = (name: string, title: string, value?: number) => (
    <div>
      <label className={label}>{title}</label>
      <input name={name} type="number" step="any" required defaultValue={value ?? 0} className={input} />
    </div>
  );

  return (
    <>
      {pin ? (
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Tahrirlaş">
          <Edit2 size={16} />
        </button>
      ) : (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-5 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-accent transition-all">
          <Plus size={16} /> Pin qöşiş
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-primary">{pin ? 'Pinni tahrirlaş' : 'Yangi pin'}</h2>
                <p className="text-xs text-gray-400">3D turdagi bino belgisi</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex gap-2.5 items-start p-3 bg-primary/5 rounded-xl text-[12px] text-primary/70 leading-relaxed">
                <Info size={16} className="text-accent shrink-0 mt-0.5" />
                <span>
                  <b>Mesh nomi</b> — .glb içidagi bino obyekti nomi (hozirgi placeholder modelda <b>blok_1</b> … <b>blok_28</b>).
                  Şu nomli bino brend rangda körsatiladi. Koordinatalar model birligida (metr): <b>Y</b> — balandlik.
                </span>
              </div>

              {error && <div className="p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">{error}</div>}

              <div>
                <label className={label}>Loyiha</label>
                <select name="project_id" required defaultValue={pin?.project_id ?? ''} className={input}>
                  <option value="" disabled>Tanlang…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name_uz}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Mesh nomi</label>
                  <input name="mesh_name" type="text" placeholder="blok_1" defaultValue={pin?.mesh_name ?? ''} className={input} />
                </div>
                <div>
                  <label className={label}>Tartib raqami</label>
                  <input name="sort_order" type="number" defaultValue={pin?.sort_order ?? 0} className={input} />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-primary mb-2">Pin joyi</p>
                <div className="grid grid-cols-3 gap-3">
                  {coord('x', 'X', pin?.x)}
                  {coord('y', 'Y (balandlik)', pin?.y)}
                  {coord('z', 'Z', pin?.z)}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-primary mb-2">Kamera nuqtasi <span className="text-gray-300 font-normal text-xs">— bino tanlanganda kamera şu yerga uçadi</span></p>
                <div className="grid grid-cols-3 gap-3">
                  {coord('cam_x', 'Kamera X', pin?.cam_x)}
                  {coord('cam_y', 'Kamera Y', pin?.cam_y)}
                  {coord('cam_z', 'Kamera Z', pin?.cam_z)}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-primary mb-2">Yozuv <span className="text-gray-300 font-normal text-xs">— böş qolsa loyiha nomi çiqadi</span></p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={label}>UZ</label>
                    <input name="label_uz" type="text" defaultValue={pin?.label_uz ?? ''} className={input} />
                  </div>
                  <div>
                    <label className={label}>RU</label>
                    <input name="label_ru" type="text" defaultValue={pin?.label_ru ?? ''} className={input} />
                  </div>
                  <div>
                    <label className={label}>EN</label>
                    <input name="label_en" type="text" defaultValue={pin?.label_en ?? ''} className={input} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Bekor qiliş</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                  {loading ? 'Saqlanmoqda...' : pin ? 'Saqlaş' : 'Qöşiş'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
