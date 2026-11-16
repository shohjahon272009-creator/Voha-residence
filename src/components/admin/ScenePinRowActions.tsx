'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteScenePin } from '@/lib/sceneActions';
import type { ScenePin } from '@/lib/scene';
import ScenePinModal from './ScenePinModal';

export default function ScenePinRowActions({ pin, projects }: { pin: ScenePin; projects: { id: number; name_uz: string }[] }) {
  const handleDelete = async () => {
    if (!window.confirm("Rostdan ham bu pinni o'chirmoqchimisiz? Loyiha va xonadonlar o'chmaydi, faqat 3D turdagi belgi yo'qoladi.")) return;
    try {
      await deleteScenePin(pin.id);
    } catch {
      alert("O'chirib bo'lmadi. Qayta urinib ko'ring.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <ScenePinModal pin={pin} projects={projects} />
      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all" title="O'chirish">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
