'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Apartment } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { submitPriceRequest } from '@/lib/contactActions';
import { useHydrated } from '@/lib/useHydrated';

/*
  "Narxini bilish" — xonadon bo'yicha ariza (uz/ru/en). Telefonda oyna ekranga sig'adi
  (ichida scroll), Escape bilan yopiladi, server xatosida spinner qotib qolmaydi.
*/
const T: Record<string, {
  title: string; sub: (n: string, f: number) => string; name: string; namePh: string; phone: string; msg: string; msgPh: string;
  send: string; done: string; doneSub: string; close: string; err: string;
}> = {
  uz: {
    title: 'Narxini bilish', sub: (n, f) => `№ ${n} xonadon, ${f}-qavat. Telefon raqamingizni qoldiring — narxini aytamiz!`,
    name: 'Ismingiz', namePh: 'Ixtiyoriy', phone: 'Telefon raqam', msg: "Qo'shimcha xabar (ixtiyoriy)", msgPh: "Savol yoki xohishingizni yozing…",
    send: 'Narxini bilish', done: "So'rovingiz qabul qilindi!", doneSub: "Tez orada menejerlarimiz siz bilan bog'lanishadi.", close: 'Yopish',
    err: "Xatolik yuz berdi. Qayta urinib ko'ring yoki qo'ng'iroq qiling.",
  },
  ru: {
    title: 'Узнать цену', sub: (n, f) => `Квартира № ${n}, ${f}-этаж. Оставьте номер телефона — мы сообщим цену!`,
    name: 'Ваше имя', namePh: 'Необязательно', phone: 'Номер телефона', msg: 'Дополнительное сообщение (необязательно)', msgPh: 'Напишите вопрос или пожелание…',
    send: 'Узнать цену', done: 'Заявка принята!', doneSub: 'Наш менеджер скоро свяжется с вами.', close: 'Закрыть',
    err: 'Произошла ошибка. Попробуйте ещё раз или позвоните нам.',
  },
  en: {
    title: 'Get the price', sub: (n, f) => `Apartment No. ${n}, floor ${f}. Leave your phone number and we will tell you the price!`,
    name: 'Your name', namePh: 'Optional', phone: 'Phone number', msg: 'Additional message (optional)', msgPh: 'Write your question or wish…',
    send: 'Get the price', done: 'Request received!', doneSub: 'Our manager will contact you shortly.', close: 'Close',
    err: 'Something went wrong. Please try again or call us.',
  },
};

export default function BookingModal({
  apartment,
  lang,
  onClose,
}: {
  apartment: Apartment;
  lang: Locale;
  onClose: () => void;
}) {
  const t = T[lang] || T.uz;
  const [loading, setLoading] = useState(false);
  // JS yuklanmaguncha yuborilmasin — aks holda brauzer formani GET qilib, ism/telefonni URL'ga yozardi
  const hydrated = useHydrated();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Escape bilan yopish + orqa sahifa scroll'ini to'xtatish (Lenis ham)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    window.__lenis?.stop();
    return () => { window.removeEventListener('keydown', onKey); window.__lenis?.start(); };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.append('apartmentId', apartment.id.toString());
    try {
      const res = await submitPriceRequest(formData);
      if (res.success) setSuccess(true);
      // Server xabarlari o'zbekcha — boshqa tillarda umumiy tarjima qilingan matn
      else setError(lang === 'uz' && res.error ? res.error : t.err);
    } catch {
      setError(t.err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="fixed inset-0 bg-primary/60" onClick={onClose} />

      <div className="relative w-full max-w-lg my-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <button onClick={onClose} aria-label={t.close} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        {success ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-6">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-4">{t.done}</h3>
            <p className="text-gray-400 mb-8">{t.doneSub}</p>
            <button onClick={onClose} className="px-10 py-4 bg-primary text-white font-bold rounded-xl w-full">
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} method="post" className="p-6 sm:p-10">
            <h3 className="text-2xl font-bold text-primary mb-2 pr-8">{t.title}</h3>
            <p className="text-gray-400 text-sm mb-6 sm:mb-8">{t.sub(String(apartment.number), apartment.floor)}</p>

            {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">{error}</div>}

            <div className="space-y-5">
              <div>
                <label htmlFor="bm-name" className="block text-sm font-bold text-gray-700 mb-2">{t.name}</label>
                <input id="bm-name" name="name" type="text" autoComplete="name" maxLength={100} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" placeholder={t.namePh} />
              </div>
              <div>
                <label htmlFor="bm-phone" className="block text-sm font-bold text-gray-700 mb-2">{t.phone} *</label>
                <input id="bm-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={40} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" placeholder="+998" />
              </div>
              <div>
                <label htmlFor="bm-msg" className="block text-sm font-bold text-gray-700 mb-2">{t.msg}</label>
                <textarea id="bm-msg" name="message" rows={3} maxLength={1000} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none" placeholder={t.msgPh}></textarea>
              </div>
              <div className="pt-2">
                <button
                  disabled={loading || !hydrated}
                  type="submit"
                  className="w-full py-4 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 hover:bg-primary transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : t.send}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
