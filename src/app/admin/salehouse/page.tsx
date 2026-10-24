import React from 'react';
import Link from 'next/link';
import { RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import db from '@/lib/db';
import { salehouseConfigured } from '@/lib/salehouse';
import { buildReport, type SyncReport } from '@/lib/salehouseSync';
import { applySaleHouseSync, setSaleHouseAuto } from '@/lib/salehouseActions';

export const dynamic = 'force-dynamic';

/*
  Sale House -> sayt xonadon holatlari. "Solishtirish" faqat hisobot (hech narsa o'zgarmaydi),
  "Qo'llash" sayt bazasidagi holatlarni yangilaydi. Sale House'ga hech qachon yozilmaydi.
*/
export default async function SaleHousePage({ searchParams }: { searchParams: Promise<{ run?: string; applied?: string }> }) {
  const { run, applied } = await searchParams;
  const configured = salehouseConfigured();
  const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('_salehouse_auto', '_salehouse_last_sync', '_salehouse_error')").all() as { key: string; value: string }[];
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const auto = s._salehouse_auto === '1';
  let last: { at?: string; applied?: number; changes?: number } = {};
  try { last = s._salehouse_last_sync ? JSON.parse(s._salehouse_last_sync) : {}; } catch { /* ignore */ }

  let report: SyncReport | null = null;
  let error = '';
  if (configured && run) {
    try { report = await buildReport(); } catch (e) { error = (e as Error).message; }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sale House sinxronlash</h1>
          <p className="text-gray-500 mt-1">Xonadonlar holati (bo&apos;sh / bron / sotilgan) Sale House&apos;dan saytga olinadi.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-success font-bold bg-success/10 px-4 py-2 rounded-xl">
          <ShieldCheck size={18} /> Faqat o&apos;qish — Sale House&apos;da hech narsa o&apos;zgarmaydi
        </div>
      </div>

      {!configured ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <h3 className="font-bold text-lg text-primary mb-2">Ulanmagan</h3>
          <p className="text-gray-500 text-sm">
            Sale House&apos;dan sayt uchun alohida, faqat o&apos;qish huquqli Inventory API kaliti olinib, serverdagi
            sozlama fayliga qo&apos;yilishi kerak (SALEHOUSE_API_URL, SALEHOUSE_API_TOKEN). Kalit bu sahifaga yoki saytga kiritilmaydi.
          </p>
        </div>
      ) : (
        <>
          {applied != null && (
            <div className="flex items-center gap-3 bg-success/10 text-success font-bold rounded-2xl p-4">
              <CheckCircle2 size={20} /> {applied} ta xonadon holati yangilandi.
            </div>
          )}
          {s._salehouse_error && (
            <div className="flex items-start gap-3 bg-danger/10 text-danger rounded-2xl p-4 text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" /> Oxirgi avtomatik urinish xatosi: {s._salehouse_error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Oxirgi sinxronlash</div>
              <div className="text-primary font-bold">{last.at ? new Date(last.at).toLocaleString('ru-RU') : '—'}</div>
              {last.at && <div className="text-sm text-gray-500 mt-1">{last.applied ?? 0} ta xonadon yangilangan</div>}
            </div>
            <form action={setSaleHouseAuto} className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avtomatik (har 10 daqiqada)</div>
                <div className={`font-bold ${auto ? 'text-success' : 'text-gray-500'}`}>{auto ? 'Yoqilgan' : "O'chirilgan"}</div>
              </div>
              <input type="hidden" name="on" value={auto ? '0' : '1'} />
              <button className={`px-5 py-2.5 rounded-xl font-bold text-sm ${auto ? 'bg-gray-100 text-gray-600' : 'bg-primary text-white'}`}>
                {auto ? "O'chirish" : 'Yoqish'}
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/salehouse?run=1" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold">
              <RefreshCw size={18} /> Solishtirish (hisobot)
            </Link>
            {report && report.changes.length > 0 && (
              <form action={applySaleHouseSync}>
                <button className="px-6 py-3 rounded-xl bg-accent text-white font-bold">
                  Qo&apos;llash — {report.changes.length} ta xonadonni yangilash
                </button>
              </form>
            )}
          </div>

          {error && <div className="bg-danger/10 text-danger rounded-2xl p-4 text-sm">{error}</div>}

          {report && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ['Sale House bloklari', report.blocks.length],
                  ["O'zgaradigan holatlar", report.changes.length],
                  ["Saytda yo'q xonadonlar", report.notOnSite],
                  ["Sale House'da yo'q", report.notInSaleHouse],
                ].map(([l, v]) => (
                  <div key={String(l)} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="text-2xl font-black text-primary">{v}</div>
                    <div className="text-xs text-gray-500 mt-1">{l}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 font-bold text-primary border-b border-gray-100">Bloklar mosligi</div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr><th className="text-left px-6 py-3">Sale House</th><th className="text-left px-6 py-3">Saytdagi loyiha</th><th className="text-left px-6 py-3">Qanday</th><th className="text-right px-6 py-3">Mos / jami</th></tr>
                  </thead>
                  <tbody>
                    {report.blocks.map((b) => (
                      <tr key={b.sh.id} className="border-t border-gray-50">
                        <td className="px-6 py-3">{b.sh.projectName} · {b.sh.name}</td>
                        <td className={`px-6 py-3 ${b.siteProject ? '' : 'text-danger font-bold'}`}>{b.siteProject?.name_uz ?? 'mos topilmadi'}</td>
                        <td className="px-6 py-3 text-gray-500">{b.how}</td>
                        <td className="px-6 py-3 text-right">{b.matched} / {b.shCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {report.changes.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 font-bold text-primary border-b border-gray-100">Qo&apos;llansa o&apos;zgaradigan holatlar</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr><th className="text-left px-6 py-3">Loyiha</th><th className="text-left px-6 py-3">Xonadon</th><th className="text-left px-6 py-3">Hozir saytda</th><th className="text-left px-6 py-3">Sale House&apos;da</th></tr>
                    </thead>
                    <tbody>
                      {report.changes.slice(0, 300).map((c) => (
                        <tr key={c.aptId} className="border-t border-gray-50">
                          <td className="px-6 py-3">{c.project}</td>
                          <td className="px-6 py-3">№{c.number}</td>
                          <td className="px-6 py-3 text-gray-500">{c.from}</td>
                          <td className="px-6 py-3 font-bold text-primary">{c.to}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {report.unmatchedSiteProjects.length > 0 && (
                <p className="text-xs text-gray-400">Sale House&apos;ga mos kelmagan sayt loyihalari (o&apos;zgarmaydi): {report.unmatchedSiteProjects.join(', ')}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
