 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';

// The public site reads live data from SQLite, so it must be rendered on demand
// rather than statically prerendered. Static generation runs the native
// better-sqlite3 module inside Turbopack worker processes, which crash with
// "Jest worker encountered child process exceptions". force-dynamic (cascading to
// every /[lang]/* page) keeps rendering in the main server process where it works.
export const dynamic = 'force-dynamic';

// This layout is now a simple wrapper to avoid hydration mismatch with the root layout
export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Note: We don't render <html> or <body> here anymore
  // But we could render a div with a dir attribute if needed
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
