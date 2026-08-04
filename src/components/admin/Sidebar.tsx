 
 
 
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Home,
  Newspaper,
  Settings,
  MessageSquare,
  LogOut
} from 'lucide-react';
import VohaLogo from '@/components/common/VohaLogo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { logout } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({
  newInquiriesCount
}: {
  newBookingsCount?: number;
  newInquiriesCount: number;
  companyLogo?: string;
  companyName?: string;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/projects', icon: Building2, label: 'Loyihalar' },
    { href: '/admin/apartments', icon: Home, label: 'Xonadonlar' },
    { href: '/admin/inquiries', icon: MessageSquare, label: 'Murojaatlar', badge: newInquiriesCount },
    { href: '/admin/news', icon: Newspaper, label: 'Yangiliklar' },
    { href: '/admin/settings', icon: Settings, label: 'Sozlamalar' },
  ];

  return (
    <aside className="w-72 bg-primary flex-shrink-0 flex flex-col shadow-2xl z-50 relative">
      <div className="p-8 pb-12">
        <div className="flex items-center justify-center">
           <VohaLogo className="w-40 h-auto" isScrolled={false} />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm",
                active ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={active ? "text-accent" : ""} />
                {item.label}
              </div>
              {item.badge ? (
                <span className="bg-accent text-primary px-2 py-0.5 rounded-full text-xs font-bold shadow-lg shadow-accent/20">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="p-6">
         <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-white/50 hover:text-danger hover:bg-danger/5 rounded-xl transition-all font-medium text-sm">
            <LogOut size={20} />
            Chiqish
         </button>
      </form>
    </aside>
  );
}
