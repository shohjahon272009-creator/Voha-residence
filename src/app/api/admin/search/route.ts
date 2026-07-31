/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  
  const query = `%${q}%`;
  
  try {
    const results = [];
    
    // Search projects
    const projects = db.prepare("SELECT id, title_uz as title FROM projects WHERE title_uz LIKE ? OR title_ru LIKE ? OR title_en LIKE ? LIMIT 3").all(query, query, query) as any[];
    if (projects.length > 0) {
      results.push({ 
        group: 'Loyihalar', 
        items: projects.map(p => ({ title: p.title, href: `/admin/projects` })) 
      });
    }
    
    // Search bookings
    const bookings = db.prepare("SELECT id, client_name as title, phone FROM bookings WHERE client_name LIKE ? OR phone LIKE ? LIMIT 3").all(query, query) as any[];
    if (bookings.length > 0) {
      results.push({ 
        group: 'Buyurtmalar', 
        items: bookings.map(b => ({ title: `${b.title} (${b.phone})`, href: `/admin/bookings` })) 
      });
    }
    
    // Search apartments
    const apartments = db.prepare(`
      SELECT a.id, a.number, p.title_uz as project_title 
      FROM apartments a 
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.number LIKE ? 
      LIMIT 3
    `).all(query) as any[];
    
    if (apartments.length > 0) {
      results.push({ 
        group: 'Kvartiralar', 
        items: apartments.map(a => ({ title: `${a.project_title} - ${a.number}-xona`, href: `/admin/apartments` })) 
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
