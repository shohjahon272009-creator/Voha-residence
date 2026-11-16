import React from 'react';
import Link from 'next/link';
import { Boxes, ExternalLink } from 'lucide-react';
import db from '@/lib/db';
import { getScenePins, PLACEHOLDER_MODEL_URL } from '@/lib/scene';
import ScenePinModal from '@/components/admin/ScenePinModal';
import ScenePinRowActions from '@/components/admin/ScenePinRowActions';
import SceneModelForm from '@/components/admin/SceneModelForm';

export const dynamic = 'force-dynamic';

// Admin: 3D tur pinlari (bino ↔ loyiha bog'lanishi) va model manzili
export default async function AdminScene3D() {
  const pins = await getScenePins();
  // Faqat id va nom — SELECT * base64 rasmlarni ham tortardi
  const projects = (await db.prepare('SELECT id, name_uz FROM projects ORDER BY id DESC').all()) as { id: number; name_uz: string }[];
  const modelRow = (await db.prepare("SELECT value FROM settings WHERE key = 'scene_model_url'").get()) as { value: string } | undefined;
  const nameOf = new Map(projects.map((p) => [p.id, p.name_uz]));
  const fmt = (n: number) => Math.round(n * 10) / 10;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">3D pinlar</h1>
          <p className="text-gray-400 text-sm">3D turdagi bino belgilari va model. Pin bog&apos;langan bino brend rangda ko&apos;rinadi.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/uz/3d" target="_blank" className="flex items-center gap-1.5 px-5 py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-all">
            <ExternalLink size={16} /> Saytda ko&apos;rish
          </Link>
          <ScenePinModal projects={projects} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Boxes className="text-accent" />
          <h3 className="font-bold text-xl text-primary">3D model</h3>
          {!modelRow?.value && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-500">Placeholder: {PLACEHOLDER_MODEL_URL}</span>
          )}
        </div>
        <SceneModelForm url={modelRow?.value || ''} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loyiha</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mesh nomi</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pin (x, y, z)</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kamera (x, y, z)</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yozuv</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pins.map((pin) => (
              <tr key={pin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="font-bold text-primary text-sm">{nameOf.get(pin.project_id) || <span className="text-danger">Loyiha o&apos;chirilgan (#{pin.project_id})</span>}</div>
                  <div className="text-[10px] text-gray-400">Tartib: {pin.sort_order}</div>
                </td>
                <td className="px-8 py-5 text-sm text-gray-500 font-mono">{pin.mesh_name || '—'}</td>
                <td className="px-8 py-5 text-sm text-gray-500 tabular-nums">{fmt(pin.x)}, {fmt(pin.y)}, {fmt(pin.z)}</td>
                <td className="px-8 py-5 text-sm text-gray-500 tabular-nums">{fmt(pin.cam_x)}, {fmt(pin.cam_y)}, {fmt(pin.cam_z)}</td>
                <td className="px-8 py-5 text-sm text-gray-500">{pin.label_uz || <span className="text-gray-300">loyiha nomi</span>}</td>
                <td className="px-8 py-5">
                  <ScenePinRowActions pin={pin} projects={projects} />
                </td>
              </tr>
            ))}
            {pins.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-sm text-gray-400">
                  Hali pin yo&apos;q. &quot;Pin qo&apos;shish&quot; tugmasi bilan birinchi binoni loyihaga bog&apos;lang.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
