'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import BulkApartmentModal from './BulkApartmentModal';
import AddApartmentModal from './AddApartmentModal';
import AdminFloorSection from './AdminFloorSection';

/*
  Admin xonadonlar sahifasida bitta BLOK (loyiha) — yig'ilgan holda turadi.
  Blok nomini bosganda qavatlar ochiladi. Shunda sahifa juda ixcham:
  bloklar ro'yxati -> blokni bosasiz -> qavatlar -> qavatni bosasiz -> xonadonlar.
  "Ko'p qo'shish" va "Xonadon qo'shish" tugmalari doim ko'rinib turadi.
*/
export default function AdminBlockSection({ project, apts }: { project: any; apts: any[] }) {
  const [open, setOpen] = useState(false);
  const floors = Array.from(new Set(apts.map((a) => a.floor))).sort((a, b) => a - b);
  const empty = apts.length === 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3.5 min-w-0 text-left">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Building2 size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-xl text-primary leading-tight truncate">{project.name_uz}</h3>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-bold">
              {apts.length} xonadon
            </span>
          </div>
          <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ml-1 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <BulkApartmentModal projectId={project.id} projectName={project.name_uz} />
          <AddApartmentModal projectId={project.id} projectName={project.name_uz} />
        </div>
      </div>

      {open && (
        <div className="px-5 md:px-6 pb-6 border-t border-gray-100 pt-5">
          {empty ? (
            <p className="text-xs text-gray-400">Hali xonadon yo&apos;q — <span className="font-bold text-primary">&quot;Xonadon qo&apos;shish&quot;</span> tugmasi bilan qo&apos;shing.</p>
          ) : (
            <div className="space-y-3">
              {floors.map((floor) => (
                <AdminFloorSection key={floor} floor={floor} apts={apts.filter((a) => a.floor === floor)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
