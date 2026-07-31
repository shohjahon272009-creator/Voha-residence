 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
   
  const projects = db.prepare('SELECT id, name_uz, city, district FROM projects').all() as any[];
   
  const apartments = db.prepare('SELECT project_id, floor, number, rooms, area, price_cash, status FROM apartments ORDER BY project_id, floor, number').all() as any[];

  let csvContent = '\uFEFF'; // BOM for UTF-8 Excel compatibility
  csvContent += "Loyiha,Shahar,Tuman,Qavat,Xonadon raqami,Xonalar soni,Maydoni (m2),Narxi (UZS),Holati\n";

  apartments.forEach(apt => {
    const proj = projects.find(p => p.id === apt.project_id);
    const projectName = proj ? proj.name_uz : 'Noma\'lum';
    const city = proj ? proj.city : '';
    const district = proj ? proj.district : '';
    
    // Escape quotes and commas
    const row = [
      `"${projectName}"`,
      `"${city}"`,
      `"${district}"`,
      apt.floor,
      `"${apt.number}"`,
      apt.rooms,
      apt.area,
      apt.price_cash,
      `"${apt.status}"`
    ].join(',');
    
    csvContent += row + '\n';
  });

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hisobot.csv"',
    },
  });
}
