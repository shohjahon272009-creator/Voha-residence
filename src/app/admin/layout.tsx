 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import NotificationDropdown from '@/components/admin/NotificationDropdown';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import VohaLogo from '@/components/common/VohaLogo';
import GlobalSearch from '@/components/admin/GlobalSearch';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fetch unread counts (both New and Under Review)
  const bookingsCountRow = await db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('Yangi', 'Ko''rib chiqilmoqda') AND apartment_id IS NOT NULL").get() as { c: number };
  const inquiriesCountRow = await db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'Yangi' AND apartment_id IS NULL").get() as { c: number };

  const newBookingsCount = bookingsCountRow.c;
  const newInquiriesCount = inquiriesCountRow.c;
  const totalNotifications = newBookingsCount + newInquiriesCount;

  // Fetch recent notifications
  const recentNotifications = await db.prepare(`
    SELECT b.id, b.client_name, b.created_at, b.apartment_id, a.number as apartment_number
    FROM bookings b
    LEFT JOIN apartments a ON b.apartment_id = a.id
    WHERE b.status IN ('Yangi', 'Ko''rib chiqilmoqda')
    ORDER BY b.created_at DESC
    LIMIT 5
  `).all() as any[];

  const settingsRows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('company_logo', 'company_name')").all() as {key: string, value: string}[];
  const settings = settingsRows.reduce((acc, row) => ({...acc, [row.key]: row.value}), {} as Record<string, string>);

  const sidebar = (
    <Sidebar 
      newBookingsCount={newBookingsCount} 
      newInquiriesCount={newInquiriesCount} 
      companyLogo={settings.company_logo}
      companyName={settings.company_name}
    />
  );

  const header = (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10">
       <GlobalSearch />

       <div className="flex items-center gap-6">
          <NotificationDropdown 
             totalNotifications={totalNotifications} 
             recentNotifications={recentNotifications} 
          />
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-sm font-bold text-primary">Admin</div>
             </div>
             <div className="w-10 h-10 bg-accent/10 rounded-full border-2 border-accent/20 flex items-center justify-center text-accent font-bold">
                A
             </div>
          </div>
       </div>
    </header>
  );

  return (
    <AdminLayoutClient sidebar={sidebar} header={header}>
      {children}
    </AdminLayoutClient>
  );
}
