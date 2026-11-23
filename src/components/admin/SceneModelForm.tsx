'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { saveSceneModel } from '@/lib/sceneActions';

// 3D model manzili (settings.scene_model_url). Bo'sh — placeholder model.
export default function SceneModelForm({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await saveSceneModel(new FormData(e.currentTarget));
      setMsg(res.ok ? { ok: true, text: 'Saqlandi.' } : { ok: false, text: res.error });
    } catch {
      setMsg({ ok: false, text: "Saqlab bölmadi. Qayta urinib köring." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-bold text-gray-700">3D model manzili (.glb)</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          name="scene_model_url"
          type="text"
          defaultValue={url}
          placeholder="/3d/placeholder.glb"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white"
        />
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-accent disabled:opacity-50 transition-all">
          <Save size={16} /> {loading ? 'Saqlanmoqda...' : 'Saqlaş'}
        </button>
      </div>
      <p className="text-[12px] text-gray-400 leading-relaxed">
        Böş qoldirilsa placeholder model işlaydi. Haqiqiy model: faylni serverdagi <b>public/3d/</b>{' '}papkasiga qöying va
        şu yerga <b>/3d/fayl-nomi.glb</b>{' '}deb yozing (yoki töliq https:// manzil). Saqlaganda brauzer keşi yangilanadi.
      </p>
      {msg && <p className={`text-sm font-medium ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>}
    </form>
  );
}
