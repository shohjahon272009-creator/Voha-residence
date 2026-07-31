 
 
 
 
 
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({
  sidebar,
  header,
  children
}: {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebar}
      <main className="flex-1 flex flex-col overflow-hidden">
        {header}
        <div className="flex-1 overflow-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
