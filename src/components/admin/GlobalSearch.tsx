'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{group: string, items: {title: string, href: string}[]}[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-96" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
      <input 
        type="text" 
        placeholder="Qidirish..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:bg-white focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto py-2">
              {results.map((group, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                    {group.group}
                  </div>
                  {group.items.map((item, j) => (
                    <Link 
                      key={j} 
                      href={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-accent/10 hover:text-primary transition-colors border-b border-gray-50 last:border-none"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              Hech narsa topilmadi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
