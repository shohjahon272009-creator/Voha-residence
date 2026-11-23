import React from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { requireAdmin } from '@/lib/requireAdmin';
import { leadsByDay, leadsByStatus, stockByProject, toPeriod, PERIODS, type DayCount, type ProjectStock } from '@/lib/siteStats';
import { siteLeadFunnel, type AmoFunnel } from '@/lib/amocrm';

/*
  Sayt statistikasi. Lidlarni boshqarish (Kanban, mijoz kartasi) amoCRM'da — bu yerda ikkinchi CRM yo'q.
  Har blok manbasi va davri yozilgan; xato bo'lsa faqat o'sha blok xato ko'rsatadi.
*/

export const dynamic = 'force-dynamic';

const fmtDay = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

async function safe<T>(f: () => Promise<T>): Promise<{ ok: true; v: T } | { ok: false }> {
  try { return { ok: true, v: await f() }; } catch (e) { console.error('dashboard:', (e as Error).message); return { ok: false }; }
}

function Block({ title, source, children }: { title: string; source: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <h2 className="font-bold text-lg text-primary">{title}</h2>
        <span className="text-xs text-ink-muted">{source}</span>
      </div>
      {children}
    </section>
  );
}

const ErrorNote = () => <p role="alert" className="text-sm text-st-error bg-st-error-bg rounded-xl p-4">Ma&apos;lumot olinmadi. Sahifani yangilang; takrorlansa server jurnalini tekşiring.</p>;

function LeadsChart({ data }: { data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const total = data.reduce((s, d) => s + d.total, 0);
  if (!total) return <p className="text-sm text-ink-muted py-10 text-center">Bu davrda saytdan ariza kelmagan.</p>;
  const w = 100 / data.length;
  const labelEvery = Math.ceil(data.length / 8);
  return (
    <figure>
      <svg viewBox="0 0 100 52" preserveAspectRatio="none" className="w-full h-48" role="img"
        aria-label={`Kunlik arizalar: jami ${total} ta, eng köp kunda ${max} ta`}>
        {[0.5, 1].map((f) => <line key={f} x1="0" x2="100" y1={46 - 44 * f} y2={46 - 44 * f} stroke="#E2DACB" strokeWidth="0.2" />)}
        {data.map((d, i) => {
          const hA = (44 * d.apartment) / max, hG = (44 * d.general) / max;
          return (
            <g key={d.day}>
              <title>{`${fmtDay(d.day)}: ${d.total} ta (xonadon ${d.apartment}, umumiy ${d.general})`}</title>
              <rect x={i * w + w * 0.15} width={w * 0.7} y={46 - hA} height={hA} fill="#014242" />
              <rect x={i * w + w * 0.15} width={w * 0.7} y={46 - hA - hG} height={hG} fill="#D18E5B" />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-ink-muted mt-1" aria-hidden="true">
        {data.filter((_, i) => i % labelEvery === 0).map((d) => <span key={d.day}>{fmtDay(d.day)}</span>)}
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-5 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-sm bg-[#014242]" /> Xonadon arizasi</span>
        <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-sm bg-[#D18E5B]" /> Umumiy murojaat</span>
        <span>Birlik: ariza (dona) · eng köp kunda {max} ta · sana UTC</span>
      </figcaption>
    </figure>
  );
}

function Stock({ rows }: { rows: ProjectStock[] }) {
  if (!rows.length) return <p className="text-sm text-ink-muted">Sotuvdagi blok yöq.</p>;
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.id}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-primary">{r.name}</span>
            <span className="text-ink-muted">{r.total} ta xonadon</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-surface-sunken" aria-hidden="true">
            {r.total > 0 && <>
              <span className="bg-st-available" style={{ width: `${(100 * r.free) / r.total}%` }} />
              <span className="bg-st-reserved" style={{ width: `${(100 * r.reserved) / r.total}%` }} />
              <span className="bg-st-sold" style={{ width: `${(100 * r.sold) / r.total}%` }} />
            </>}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">● Böş {r.free} · ◐ Bron {r.reserved} · ✕ Sotilgan {r.sold}</p>
        </li>
      ))}
    </ul>
  );
}

function Funnel({ f, days }: { f: AmoFunnel; days: number }) {
  if (f.state === 'off') return <p className="text-sm text-ink-muted">amoCRM ulanmagan. Ulaş: <code>deploy/set-amocrm-token.sh</code>.</p>;
  if (f.state === 'error') return <p role="alert" className="text-sm text-st-error bg-st-error-bg rounded-xl p-4">amoCRM javob bermadi: {f.message}</p>;
  if (!f.total) return <p className="text-sm text-ink-muted">Oxirgi {days} kunda amoCRM&apos;da &quot;Sayt&quot; lidi yöq.</p>;
  const max = Math.max(1, ...f.stages.map((s) => s.n));
  return (
    <>
      <p className="text-sm text-ink-muted mb-4">Voronka: {f.pipeline} · jami {f.total} ta lid</p>
      <ul className="space-y-2">
        {f.stages.filter((s) => s.n > 0).map((s) => (
          <li key={s.id} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate text-primary" title={s.name}>{s.name}</span>
            <span className="h-2.5 rounded-full bg-primary" style={{ width: `${(100 * s.n) / max}%` }} aria-hidden="true" />
            <span className="tabular-nums text-ink-muted">{s.n}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  await requireAdmin();
  const days = toPeriod((await searchParams).d);
  const [byDay, byStatus, stock, funnel] = await Promise.all([
    safe(() => leadsByDay(days)), safe(() => leadsByStatus(days)), safe(() => stockByProject()), siteLeadFunnel(days),
  ]);
  const isDemo = !process.env.TURSO_DATABASE_URL;
  const leadsTotal = byDay.ok ? byDay.v.reduce((s, d) => s + d.total, 0) : null;
  const freeTotal = stock.ok ? stock.v.reduce((s, r) => s + r.free, 0) : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sayt statistikasi</h1>
          <p className="text-sm text-ink-muted mt-1">
            Lidlar bilan işlaş (bosqiçlar, mijoz kartasi) — amoCRM&apos;da.
            {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-st-reserved-bg text-st-reserved font-bold">DEMO baza</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Davr" className="flex rounded-xl border border-gray-200 bg-white p-1">
            {PERIODS.map((p) => (
              <Link key={p} href={`/admin/dashboard?d=${p}`} aria-current={p === days ? 'page' : undefined}
                className={`px-4 min-h-[40px] inline-flex items-center rounded-lg text-sm font-bold ${p === days ? 'bg-primary text-white' : 'text-primary hover:bg-gray-50'}`}>
                {p} kun
              </Link>
            ))}
          </nav>
          <a href="/api/export" download className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-primary text-sm font-bold">
            <Download size={16} aria-hidden="true" /> Xonadonlar (Excel)
          </a>
        </div>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          { k: `Arizalar (${days} kun)`, v: leadsTotal, s: 'sayt bazasi' },
          { k: 'Böş xonadonlar (hozir)', v: freeTotal, s: 'sayt bazasi, Sale House sinxroni' },
          { k: `amoCRM'dagi sayt lidlari (${days} kun)`, v: funnel.state === 'ok' ? funnel.total : null, s: 'amoCRM' },
        ].map((c) => (
          <div key={c.k} className="bg-white rounded-2xl border border-gray-200 p-5">
            <dt className="text-sm text-ink-muted">{c.k}</dt>
            <dd className="text-3xl font-bold text-primary mt-1 tabular-nums">{c.v ?? '—'}</dd>
            <dd className="text-xs text-ink-muted mt-1">Manba: {c.s}</dd>
          </div>
        ))}
      </dl>

      <Block title="Arizalar dinamikasi" source={`Manba: sayt bazasi · oxirgi ${days} kun`}>
        {byDay.ok ? <LeadsChart data={byDay.v} /> : <ErrorNote />}
      </Block>

      <div className="grid gap-8 lg:grid-cols-2">
        <Block title="Xonadon statuslari" source="Manba: sayt bazasi · hozirgi holat">
          {stock.ok ? <Stock rows={stock.v} /> : <ErrorNote />}
        </Block>
        <Block title="Savdo voronkasi (sayt lidlari)" source={`Manba: amoCRM · oxirgi ${days} kun`}>
          <Funnel f={funnel} days={days} />
        </Block>
      </div>

      <Block title="Arizalar holati (sayt içida)" source={`Manba: sayt bazasi · oxirgi ${days} kun`}>
        {byStatus.ok ? (
          byStatus.v.length ? (
            <ul className="flex flex-wrap gap-3 text-sm">
              {byStatus.v.map((s) => <li key={s.status} className="px-3 py-1.5 rounded-full bg-gray-100 text-primary">{s.status}: <b className="tabular-nums">{s.n}</b></li>)}
            </ul>
          ) : <p className="text-sm text-ink-muted">Bu davrda ariza yöq.</p>
        ) : <ErrorNote />}
      </Block>
    </div>
  );
}
