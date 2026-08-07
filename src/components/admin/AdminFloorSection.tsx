'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EditApartmentModal from './EditApartmentModal';

/*
  Admin xonadonlar sahifasida bitta qavat — YIG'ILGAN holda turadi (sodda ko'rinish).
  Qavat sarlavhasini bosganda o'sha qavat xonadonlari ochiladi. Shunda uzun ro'yxat
  qisqaradi — kerakli qavatni bosib ko'rasiz.
*/
export default function AdminFloorSection({ floor, apts }: { floor: number; apts: any[] }) {
  const [open, setOpen] = useState(false);
  const sorted = [...apts].sort((a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0));

  return (
    <div className={`rounded-2xl border transition-colors ${open ? 'border-gray-200 bg-gray-50/40' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white text-sm font-black shrink-0">{floor}</div>
        <div className="leading-none">
          <div className="text-sm font-bold text-primary">{floor}-qavat</div>
          <div className="text-[10px] text-gray-400 font-medium mt-1">{apts.length} ta xonadon</div>
        </div>
        <div className="flex-1" />
        <span className="text-[11px] font-bold text-gray-300 mr-1">{open ? 'yepish' : 'ochish'}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-3 pt-1">
          {sorted.map((apt) => (
            <EditApartmentModal key={apt.id} apt={apt} />
          ))}
        </div>
      )}
    </div>
  );
}
