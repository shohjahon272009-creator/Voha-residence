'use client';

import React, { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { setSiteSetting } from '@/lib/adminActions';

export default function SiteVisibilityToggle({
  settingKey,
  initialOn,
  label,
  hint,
}: {
  settingKey: string;
  initialOn: boolean;
  label: string;
  hint?: string;
}) {
  const [on, setOn] = useState(initialOn);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !on;
    setOn(next);
    startTransition(() => {
      setSiteSetting(settingKey, next ? 'true' : 'false');
    });
  };

  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl p-5 border transition-colors ${on ? 'bg-success/5 border-success/20' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${on ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-400'}`}>
          {on ? <Eye size={20} /> : <EyeOff size={20} />}
        </div>
        <div>
          <div className="font-bold text-primary text-sm flex items-center gap-2">
            {label}
            {pending && <Loader2 size={13} className="animate-spin text-gray-400" />}
          </div>
          <div className="text-xs text-gray-400">
            {on ? 'Saytda ko‘rinmoqda' : 'Saytda yashirilgan'}{hint ? ` — ${hint}` : ''}
          </div>
        </div>
      </div>

      {/* iOS uslubidagi switch */}
      <button
        type="button"
        onClick={toggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`relative shrink-0 w-14 h-8 rounded-full transition-colors ${on ? 'bg-success' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
