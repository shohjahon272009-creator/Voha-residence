 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import db from './db';
import { Project, Apartment } from './types';

export const getProjects = (): Project[] => {
  // Active/selling projects first, completed ("Topshirilgan") last; newest first within each group.
  // This way a newly added "Jarayonda" project shows at the top, and the earliest projects sit at the end.
  const projects = db.prepare(`
    SELECT * FROM projects
    ORDER BY
      CASE status
        WHEN 'Jarayonda' THEN 1
        WHEN 'Sanoqli kunlar qoldi' THEN 2
        WHEN 'Tez kunda' THEN 3
        WHEN 'Topshirilgan' THEN 4
        ELSE 5
      END,
      id DESC
  `).all() as any[];
  return projects.map(p => ({
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
    amenities: p.amenities ? JSON.parse(p.amenities) : []
  }));
};

export const getProjectBySlug = (id: number): Project | null => {
   
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!p) return null;
  return {
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
    amenities: p.amenities ? JSON.parse(p.amenities) : []
  };
};

export const getApartments = (projectId?: number): Apartment[] => {
  if (projectId) {
     
    return db.prepare('SELECT * FROM apartments WHERE project_id = ?').all(projectId) as any[];
  }
   
  return db.prepare('SELECT * FROM apartments').all() as any[];
};

export const getApartmentStats = () => {
    const total = db.prepare('SELECT count(*) as count FROM apartments').get() as { count: number };
    const available = db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Bo'sh") as { count: number };
    const sold = db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Band") as { count: number };
    const booked = db.prepare('SELECT count(*) as count FROM apartments WHERE status = ?').get("Bronlangan") as { count: number };
    
    return {
        total: total.count,
        available: available.count,
        sold: sold.count,
        booked: booked.count
    };
}
