 
 
 
 
'use client';

import React, { useRef, useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { Send, CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/lib/contactActions';
import { useHydrated } from '@/lib/useHydrated';

export default function ContactSection({ lang, phone, address, hours }: { lang: Locale; phone?: string; address?: string; hours?: string }) {
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // JS yuklanmaguncha yuborib bo'lmaydi — aks holda brauzer formani GET qilib, ism/telefonni URL'ga yozardi
  const hydrated = useHydrated();

  const t = {
    uz: { 
      title: "Biz bilan bog'laning", 
      subtitle: "ALOQA", 
      send: "Xabar yuborish",
      addressLabel: "Manzil",
      addressValue: "Urganch sh., Ulug'bek ko'chasi — Ekstrenniy shifoxonasi chorrahasi",
      phoneLabel: "Telefon",
      timeLabel: "Ish vaqti",
      timeValue: "Har kuni 09:00 dan 18:00 gacha",
      namePlaceholder: "Ismingiz",
      nameValue: "Ali Valiyev",
      msgPlaceholder: "Xabaringiz",
      msgValue: "Qo'shimcha savollaringiz bo'lsa yozing...",
      successMsg: "Xabaringiz yuborildi! Tez orada siz bilan bog'lanamiz.",
      errorMsg: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
    },
    ru: { 
      title: "Свяжитесь с нами", 
      subtitle: "КОНТАКТЫ", 
      send: "Отправить сообщение",
      addressLabel: "Адрес",
      addressValue: "г. Ургенч, ул. Улугбека — перекрёсток у больницы экстренной помощи",
      phoneLabel: "Телефон",
      timeLabel: "Время работы",
      timeValue: "Ежедневно с 09:00 до 18:00",
      namePlaceholder: "Ваше имя",
      nameValue: "Али Валиев",
      msgPlaceholder: "Ваше сообщение",
      msgValue: "Напишите, если у вас есть дополнительные вопросы...",
      successMsg: "Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
      errorMsg: "Произошла ошибка. Пожалуйста, попробуйте ещё раз."
    },
    en: { 
      title: "Contact Us", 
      subtitle: "CONTACT", 
      send: "Send Message",
      addressLabel: "Address",
      addressValue: "Urgench, Ulugbek street — Emergency Hospital crossroads",
      phoneLabel: "Phone",
      timeLabel: "Working hours",
      timeValue: "Every day from 09:00 to 18:00",
      namePlaceholder: "Your Name",
      nameValue: "John Doe",
      msgPlaceholder: "Your Message",
      msgValue: "Write your additional questions here...",
      successMsg: "Your message has been sent! We will contact you shortly.",
      errorMsg: "An error occurred. Please try again."
    },
  }[lang] || { 
      title: "Biz bilan bog'laning", 
      subtitle: "ALOQA", 
      send: "Xabar yuborish",
      addressLabel: "Manzil",
      addressValue: "Urganch sh., Ulug'bek ko'chasi — Ekstrenniy shifoxonasi chorrahasi",
      phoneLabel: "Telefon",
      timeLabel: "Ish vaqti",
      timeValue: "Har kuni 09:00 dan 18:00 gacha",
      namePlaceholder: "Ismingiz",
      nameValue: "Ali Valiyev",
      msgPlaceholder: "Xabaringiz",
      msgValue: "Qo'shimcha savollaringiz bo'lsa yozing...",
      successMsg: "Xabaringiz yuborildi! Tez orada siz bilan bog'lanamiz.",
      errorMsg: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
  };

  // Admin sozlagan aloqa ma'lumotlari (bo'sh bo'lsa — til bo'yicha standart matn)
  const phoneVal = phone || '+998 91 011 66 66';
  // Admin manzil/ish vaqti o'zbekcha — ru/en sahifada tarjima qilingan standart matn
  const addressVal = (lang === 'uz' && address) || t.addressValue;
  const hoursVal = (lang === 'uz' && hours) || t.timeValue;
  const telHref = 'tel:' + phoneVal.replace(/[^\d+]/g, '');
  // Ikkinchi sotuv raqami (asosiy raqam bilan bir xil bo'lmasa ko'rsatiladi)
  const phone2 = '+998 97 321 66 66';
  const showPhone2 = !phoneVal.replace(/\D/g, '').includes(phone2.replace(/\D/g, '').slice(3));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return; // ikki marta bosish — bitta ariza
    sending.current = true;
    setLoading(true);
    setError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await submitContact(formData);
      if (res.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // Server xabarlari o'zbekcha — boshqa tillarda tarjima qilingan umumiy matn
        setError(lang === 'uz' && res.error ? res.error : t.errorMsg);
      }
    } catch {
      setError(t.errorMsg);
    } finally {
      setLoading(false);
      sending.current = false;
    }
  };

  return (
    <section id="contact" className="bg-canvas text-ink py-[var(--v-section-y)]">
      <div className="max-w-page mx-auto px-[var(--v-gutter)] grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-small font-semibold text-accent-text">{t.subtitle}</p>
          <h2 className="mt-3 text-h1 font-montserrat">{t.title}</h2>
          <dl className="mt-10 border-t border-line">
            <div className="border-b border-line py-5">
              <dt className="text-small text-ink-muted">{t.phoneLabel}</dt>
              <dd className="mt-1 flex flex-col">
                <a href={telHref} className="font-montserrat text-h2 tabular-nums hover:underline underline-offset-4">{phoneVal}</a>
                {showPhone2 && (
                  <a href={'tel:' + phone2.replace(/[^\d+]/g, '')} className="font-montserrat text-h3 tabular-nums text-ink-muted hover:underline underline-offset-4">{phone2}</a>
                )}
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="text-small text-ink-muted">{t.addressLabel}</dt>
              <dd className="mt-1 text-body-lg">{addressVal}</dd>
              <dd className="mt-2">
                <a href="https://www.google.com/maps/search/?api=1&query=41.544716,60.599816" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center font-semibold text-accent-text underline underline-offset-4">
                  {lang === 'ru' ? 'Открыть на карте' : lang === 'en' ? 'Open in maps' : 'Xaritada ochish'}
                </a>
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="text-small text-ink-muted">{t.timeLabel}</dt>
              <dd className="mt-1 text-body-lg">{hoursVal}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <form onSubmit={handleSubmit} method="post" className="rounded-v-xl bg-surface p-6 sm:p-9 shadow-v-md space-y-5">
            {success && (
              <div role="status" className="bg-st-available-bg text-st-available p-4 rounded-v-md flex items-center gap-3">
                <CheckCircle2 size={20} aria-hidden="true" />
                <p className="font-semibold text-small">{t.successMsg}</p>
              </div>
            )}
            {error && <div role="alert" className="bg-st-error-bg text-st-error p-4 rounded-v-md font-semibold text-small">{error}</div>}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cs-name" className="block text-small font-semibold mb-2">{t.namePlaceholder}</label>
                <input id="cs-name" name="name" required type="text" autoComplete="name" maxLength={100} className="w-full h-13 min-h-[52px] bg-surface border border-line-strong rounded-v-md px-4 text-ink placeholder:text-ink-muted/70" placeholder={t.nameValue} />
              </div>
              <div>
                <label htmlFor="cs-phone" className="block text-small font-semibold mb-2">{t.phoneLabel}</label>
                <input id="cs-phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" maxLength={40} className="w-full min-h-[52px] bg-surface border border-line-strong rounded-v-md px-4 text-ink placeholder:text-ink-muted/70" placeholder="+998 __ ___ __ __" />
              </div>
            </div>
            <div>
              <label htmlFor="cs-msg" className="block text-small font-semibold mb-2">{t.msgPlaceholder}</label>
              <textarea id="cs-msg" name="message" rows={4} className="w-full bg-surface border border-line-strong rounded-v-md px-4 py-3 text-ink placeholder:text-ink-muted/70 resize-none" placeholder={t.msgValue}></textarea>
            </div>
            <button disabled={loading || !hydrated} type="submit" className="w-full min-h-[52px] bg-cta text-cta-ink font-bold rounded-full hover:brightness-105 active:scale-[0.99] transition duration-v-fast ease-v flex justify-center items-center gap-3 disabled:opacity-60">
              {loading ? (lang === 'ru' ? 'Отправка…' : lang === 'en' ? 'Sending…' : 'Yuborilmoqda…') : t.send} {!loading && <Send size={18} aria-hidden="true" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
