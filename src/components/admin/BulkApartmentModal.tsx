'use client';

import React, { useState } from 'react';
import { X, Rows3, Check, AlertCircle } from 'lucide-react';
import { addApartmentsBulk } from '@/lib/adminActions';

// Bitta qatorni server bilan bir xil o'qiydi (qavat, raqam, xona, maydon, narx)
type Parsed = { floor: string; number: string; rooms: string; area: string; price: string; ok: boolean };

function parseLine(line: string): Parsed {
  const p = line.split(/\t|,|;/).map((x) => x.trim());
  const floor = p[0] || '';
  const number = p[1] || '';
  const rooms = p[2] || '';
  const area = p[3] || '';
  const price = (p[4] || '').replace(/\s/g, '');
  // To'liq deb hisoblanadi: qavat, raqam, xona, maydon, narx — hammasi bo'lsa
  const ok = Boolean(floor && number && rooms && area && price && Number(price) > 0);
  return { floor, number, rooms, area, price, ok };
}

// Narxni chiroyli ajratib ko'rsatish: 483000000 -> 483 000 000
function fmtPrice(v: string): string {
  const n = Number(v);
  if (!n) return v || '—';
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

// Ko'p xonadonni bir vaqtda qo'shish. Excel'dan nusxa ko'chirib yoki qatorlab yozib bo'ladi.
export default function BulkApartmentModal({ projectId, projectName }: { projectId: number; projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseLine);

  const okCount = parsed.filter((p) => p.ok).length;

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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-primary">Ko&apos;p xonadon qo&apos;shish</h2>
                <p className="text-xs text-gray-400">{projectName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* 1-qadam: qanday yozish kerakligi — har bir raqam belgilangan namuna */}
              <div>
                <p className="text-[13px] font-bold text-primary mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[11px] mr-1.5">1</span>
                  Har bir xonadonni shunday yozing:
                </p>
                <div className="bg-primary/5 rounded-xl border border-primary/15 p-3 overflow-x-auto">
                  <div className="flex items-stretch gap-1 text-center min-w-max">
                    {[
                      { v: '5', l: 'qavat' },
                      { v: '58', l: 'xonadon raqami' },
                      { v: '2', l: 'nechta xona' },
                      { v: '74.54', l: 'maydon (m²)' },
                      { v: '483000000', l: 'narx (so‘m)' },
                    ].map((c, i, arr) => (
                      <React.Fragment key={c.l}>
                        <div className="px-1.5">
                          <div className="text-base font-black text-primary leading-tight font-mono">{c.v}</div>
                          <div className="text-[10px] font-semibold text-accent mt-1 whitespace-nowrap">{c.l}</div>
                        </div>
                        {i < arr.length - 1 && <div className="text-xl font-black text-gray-300 self-start leading-none">,</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  Raqamlarni <b className="text-gray-500">vergul (,)</b> bilan ajrating. Har bir qatorда — bitta xonadon.
                  Excel jadvalidan nusxa ko&apos;chirib qo&apos;ysangiz ham bo&apos;ladi.
                </p>
              </div>

              {/* 2-qadam: yozish maydoni */}
              <div>
                <p className="text-[13px] font-bold text-primary mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[11px] mr-1.5">2</span>
                  Shu yerga yozing:
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={7}
                  placeholder={`5, 58, 2, 74.54, 483000000
5, 60, 2, 91.84, 598000000
6, 74, 3, 88.01, 570000000`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-mono text-sm"
                />
              </div>

              {/* 3-qadam: jonli tekshiruv — yozgani jadval bo'lib chiqadi */}
              {parsed.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold text-primary mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[11px] mr-1.5">3</span>
                    Tekshiring — shu xonadonlar qo&apos;shiladi:
                  </p>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-[11px] text-gray-400 font-bold text-left">
                          <th className="px-3 py-2 font-bold">Qavat</th>
                          <th className="px-3 py-2 font-bold">Xonadon №</th>
                          <th className="px-3 py-2 font-bold">Xona</th>
                          <th className="px-3 py-2 font-bold">Maydon</th>
                          <th className="px-3 py-2 font-bold text-right">Narx (so&apos;m)</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.map((p, i) => (
                          <tr key={i} className={`border-t border-gray-100 ${p.ok ? '' : 'bg-red-50'}`}>
                            <td className="px-3 py-2 font-semibold text-primary">{p.floor || '—'}</td>
                            <td className="px-3 py-2 font-semibold text-primary">{p.number || '—'}</td>
                            <td className="px-3 py-2 text-gray-600">{p.rooms || '—'}</td>
                            <td className="px-3 py-2 text-gray-600">{p.area ? `${p.area} m²` : '—'}</td>
                            <td className="px-3 py-2 text-right font-semibold text-accent whitespace-nowrap">{fmtPrice(p.price)}</td>
                            <td className="px-2 py-2 text-center">
                              {p.ok
                                ? <Check size={15} className="text-green-500 inline" />
                                : <AlertCircle size={15} className="text-red-400 inline" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {okCount < parsed.length && (
                    <p className="text-[11px] text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Qizil qatorlarda biror ma&apos;lumot yetishmayapti — to&apos;ldiring.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Bekor qilish</button>
                <button onClick={submit} disabled={loading || okCount === 0} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-accent disabled:opacity-50">
                  {loading ? 'Qo‘shilmoqda...' : `${okCount} ta xonadon qo‘shish`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
