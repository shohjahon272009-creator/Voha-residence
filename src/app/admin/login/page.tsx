 
 
 
 
 
'use client';

import React, { useActionState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { login } from '@/lib/auth';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);
  const error = state?.error;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">ADMIN PANEL</h1>
            <p className="text-gray-400 text-sm">Xush kelibsiz, boshqarish uchun kiring</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="email"
                   name="email"
                   required
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                   placeholder="admin@qurilish.uz"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Parol</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="password"
                   name="password"
                   required
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                   placeholder="••••••••"
                 />
               </div>
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between py-2">
               <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-200 accent-primary" />
                  Eslab qolish
               </label>
               <button type="button" className="text-sm font-medium text-accent">Parolni unutdingizmi?</button>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-70"
            >
              {pending ? <Loader2 className="animate-spin" /> : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
