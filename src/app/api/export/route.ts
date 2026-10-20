import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminId } from '@/lib/requireAdmin';

type ProjectRow = { id: number; name_uz: string; city: string | null; district: string | null };
type AptRow = { project_id: number; floor: number; number: string; rooms: number; area: number; price_cash: number; status: string };

// CSV maydoni: ichidagi qo'shtirnoq ikkilanadi (aks holda Excel ustunlari siljiydi), = + - @ bilan
// boshlangan matn oldiga ' qo'yiladi (aks holda Excel uni formula sifatida ishga tushirardi).
function cell(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await getAdminId())) return new NextResponse("Unauthorized", { status: 401 });

  const projects = await db.prepare('SELECT id, name_uz, city, district FROM projects').all() as ProjectRow[];
  const byId = new Map(projects.map((p) => [p.id, p]));
  const apartments = await db.prepare('SELECT project_id, floor, number, rooms, area, price_cash, status FROM apartments ORDER BY project_id, floor, number').all() as AptRow[];

  let csvContent = '﻿'; // BOM for UTF-8 Excel compatibility
  csvContent += "Loyiha,Shahar,Tuman,Qavat,Xonadon raqami,Xonalar soni,Maydoni (m2),Narxi (UZS),Holati\n";

  for (const apt of apartments) {
    const proj = byId.get(apt.project_id);
    csvContent += [
      cell(proj ? proj.name_uz : "Noma'lum"),
      cell(proj?.city),
      cell(proj?.district),
      cell(apt.floor),
      cell(apt.number),
      cell(apt.rooms),
      cell(apt.area),
      cell(apt.price_cash),
      cell(apt.status),
    ].join(',') + '\n';
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hisobot.csv"',
    },
  });
}
