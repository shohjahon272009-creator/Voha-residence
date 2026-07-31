 
 
 
 
 
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CalendarCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type NotificationItem = {
  id: number;
  client_name: string;
  created_at: string;
  apartment_id: number | null;
  apartment_number: string | null;
};

export default function NotificationDropdown({
  totalNotifications,
  recentNotifications
}: {
  totalNotifications: number;
  recentNotifications: NotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-400 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-gray-50"
      >
         <Bell size={22} />
         {totalNotifications > 0 && (
           <span className="absolute 1 top-1 right-1 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4">
             {totalNotifications}
           </span>
         )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-primary">Bildirishnomalar</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
              {totalNotifications} ta yangi
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentNotifications.map(notif => (
                  <Link 
                    key={notif.id} 
                    href={notif.apartment_id ? '/admin/bookings' : '/admin/inquiries'}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.apartment_id ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                    }`}>
                      {notif.apartment_id ? <CalendarCheck size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {notif.apartment_id 
                          ? `Yangi bron: ${notif.client_name} - ${notif.apartment_number}-xonadon` 
                          : `Yangi murojaat: ${notif.client_name}`
                        }
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(notif.created_at + 'Z').toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour12: false })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Yangi xabarlar yo&apos;q</p>
              </div>
            )}
          </div>

          {(totalNotifications > 0) && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-2">
               <Link href="/admin/bookings" onClick={() => setIsOpen(false)} className="flex-1 text-center text-xs font-bold text-primary py-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                  Bronlar
               </Link>
               <Link href="/admin/inquiries" onClick={() => setIsOpen(false)} className="flex-1 text-center text-xs font-bold text-primary py-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                  Murojaatlar
               </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
