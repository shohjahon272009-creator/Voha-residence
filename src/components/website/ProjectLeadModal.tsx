'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, Phone } from 'lucide-react';
import { Locale } from '@/lib/dictionaries';
import { submitContact } from '@/lib/contactActions';

const T: Record<Locale, {
  title: string; sub: string; name: string; namePh: string; phone: string; msg: string; msgPh: string;
  submit: string; sending: string; success: string; successSub: string; close: string; err: string;
}> = {
  uz: {
    title: "Narxini bilish", sub: "loyihasi bo'yicha maxsus taklif va aniq narxni oling",
    name: "Ismingiz", namePh: "F.I.SH (ixtiyoriy)", phone: "Telefon raqami", msg: "Xabar (ixtiyoriy)",
    msgPh: "Qiziqtirgan savolingizni yozing…", submit: "So'rov yuborish", sending: "Yuborilmoqda…",
    success: "So'rovingiz qabul qilindi!", successSub: "Menejerlarimiz tez orada bog'lanib, narxni aytishadi.",
    close: "Yopish", err: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
  },
  ru: {
    title: "Узнать цену", sub: "— получите спецпредложение и точную цену по проекту",
    name: "Ваше имя", namePh: "ФИО (необязательно)", phone: "Номер телефона", msg: "Сообщение (необязательно)",
    msgPh: "Напишите свой вопрос…", submit: "Отправить заявку", sending: "Отправка…",
    success: "Заявка принята!", successSub: "Наши менеджеры скоро свяжутся и назовут цену.",
    close: "Закрыть", err: "Произошла ошибка. Попробуйте снова.",
  },
  en: {
    title: "Get the price", sub: "— receive a special offer and the exact price for this project",
    name: "Your name", namePh: "Full name (optional)", phone: "Phone number", msg: "Message (optional)",
    msgPh: "Write your question…", submit: "Send request", sending: "Sending…",
    success: "Request received!", successSub: "Our managers will contact you shortly with the price.",
    close: "Close", err: "Something went wrong. Please try again.",
  },
};

export default function ProjectLeadModal({
  projectName,
  lang,
  onClose,
}: {
  projectName: string;
  lang: Locale;
  onClose: () => void;
}) {
  const t = T[lang] || T.uz;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Tag the lead with the project so the admin knows what it's about
    const userMsg = String(fd.get('message') || '');
    fd.set('message', `🏢 ${projectName} — narx so'rovi. ${userMsg}`.trim());
    const res = await submitContact(fd);
    if (res.success) setSuccess(true);
    else setError(res.error || t.err);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors z-10">
          <X size={24} />
        </button>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-6">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">{t.success}</h3>
            <p className="text-gray-400 mb-8">{t.successSub}</p>
            <button onClick={onClose} className="px-10 py-4 bg-primary text-white font-bold rounded-xl w-full hover:bg-accent transition-all">
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
                <Phone size={20} />
              </div>
              <h3 className="text-2xl font-bold text-primary">{t.title}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-8"><span className="font-bold text-primary">{projectName}</span> {t.sub}</p>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.name}</label>
                <input name="name" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-colors" placeholder={t.namePh} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.phone} *</label>
                <input name="phone" type="tel" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-colors" placeholder="+998" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.msg}</label>
                <textarea name="message" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-colors resize-none" placeholder={t.msgPh}></textarea>
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 hover:bg-primary transition-all">
                {loading ? <Loader2 className="animate-spin" size={20} /> : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
