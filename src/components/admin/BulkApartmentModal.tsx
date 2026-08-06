'use client';

import React, { useState } from 'react';
import { X, Rows3 } from 'lucide-react';
import { addApartmentsBulk } from '@/lib/adminActions';

// Ko'p xonadonni bir vaqtda qo'shish. Excel'dan nusxa ko'chirib yoki qatorlab yozib bo'ladi.
export default function BulkApartmentModal({ projectId, projectName }: { projectId: number; projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const rows = text.split(/\r?\n/).filter((l) => l.trim()).length;

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await addApartmentsBulk(projectId, text);
    setLoading(false);
    setText('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent font-bold rounded-xl text-xs hover:bg-accent hover:text-white transition-all"
      >
        <Rows3 size={15} /> Ko&apos;p qo&apos;shish
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-primary">Ko&apos;p xonadon qo&apos;shish</h2>
                <p className="text-xs text-gray-400">{projectName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl">
                <p className="text-[13px] font-bold text-primary mb-3">Har bir xonadonni shunday yozing:</p>

                {/* Namuna — har bir raqam nimani anglatishi belgilangan */}
                <div className="bg-white rounded-xl border border-primary/15 p-3 overflow-x-auto">
                  <div className="flex items-stretch gap-1 text-center min-w-max font-mono">
                    {[
                      { v: '5', l: 'qavat' },
                      { v: '58', l: 'xonadon №' },
                      { v: '2', l: 'nechta xona' },
                      { v: '74.54', l: 'maydon (m²)' },
                      { v: '483000000', l: 'narx (so‘m)' },
                    ].map((c, i, arr) => (
                      <React.Fragment key={c.l}>
                        <div className="px-1.5">
                          <div className="text-base font-black text-primary leading-tight">{c.v}</div>
                          <div className="text-[10px] font-sans font-semibold text-accent mt-1 whitespace-nowrap">{c.l}</div>
                        </div>
                        {i < arr.length - 1 && <div className="text-xl font-black text-gray-300 self-start leading-none">,</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-primary/60 mt-3 leading-relaxed">
                  Raqamlarni <b>vergul bilan</b> ajrating. Har bir qatorда — bitta xonadon.<br />
                  Excel jadvalidan to&apos;g&apos;ridan-to&apos;g&apos;ri nusxa ko&apos;chirib qo&apos;ysangiz ham bo&apos;ladi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Xonadonlarni shu yerga yozing</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={9}
                  placeholder={`5, 58, 2, 74.54, 483000000
5, 60, 2, 91.84, 598000000
6, 74, 3, 88.01, 570000000`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-mono text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">Tayyor bo&apos;lgan xonadonlar: <b className="text-primary">{rows}</b> ta</p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Bekor qilish</button>
                <button onClick={submit} disabled={loading || rows === 0} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                  {loading ? 'Qo‘shilmoqda...' : `${rows} ta qo‘shish`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
