'use client';

import React, { useActionState } from 'react';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { changePassword } from '@/lib/auth';

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <KeyRound className="text-accent" />
        <h3 className="font-bold text-xl text-primary">Parolni o&apos;zgartirish</h3>
      </div>

      <form action={formAction} className="space-y-6" key={state?.success ? 'reset' : 'form'}>
        {state?.error && (
          <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl font-medium">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-4 bg-success/10 border border-success/20 text-success text-sm rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 size={18} /> Parol muvaffaqiyatli o&apos;zgartirildi.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Joriy parol</label>
            <input name="current_password" type="password" required autoComplete="current-password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Yangi parol</label>
            <input name="new_password" type="password" required minLength={6} autoComplete="new-password" placeholder="Kamida 6 ta belgi" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Yangi parolni takrorlang</label>
            <input name="confirm_password" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-colors" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={pending} className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-accent transition-all disabled:opacity-50">
            {pending ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            Parolni yangilash
          </button>
        </div>
      </form>
    </div>
  );
}
