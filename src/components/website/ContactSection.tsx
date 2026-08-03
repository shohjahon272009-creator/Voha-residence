 
 
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/dictionaries';
import { MapPin, Phone, Clock, Send, CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/lib/contactActions';

export default function ContactSection({ lang, phone, address, hours }: { lang: Locale; phone?: string; address?: string; hours?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = {
    uz: { 
      title: "Biz bilan bog'laning", 
      subtitle: "ALOQA", 
      send: "Xabar yuborish",
      addressLabel: "Manzil",
      addressValue: "Xorazm viloyati, Urganch shahri, Amir Temur ko'chasi, 1A uy",
      phoneLabel: "Telefon",
      timeLabel: "Ish vaqti",
      timeValue: "Har kuni 09:00 dan 18:00 gacha",
      namePlaceholder: "Ismingiz",
      nameValue: "Ali Valiyev",
      msgPlaceholder: "Xabaringiz",
      msgValue: "Qo'shimcha savollaringiz bo'lsa yozing...",
      successMsg: "Xabaringiz yuborildi! Tez orada siz bilan bog'lanamiz.",
      errorMsg: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
    },
    ru: { 
      title: "Свяжитесь с нами", 
      subtitle: "КОНТАКТЫ", 
      send: "Отправить сообщение",
      addressLabel: "Адрес",
      addressValue: "Хорезмская область, город Ургенч, улица Амира Темура, дом 1А",
      phoneLabel: "Телефон",
      timeLabel: "Время работы",
      timeValue: "Ежедневно с 09:00 до 18:00",
      namePlaceholder: "Ваше имя",
      nameValue: "Али Валиев",
      msgPlaceholder: "Ваше сообщение",
      msgValue: "Напишите, если у вас есть дополнительные вопросы...",
      successMsg: "Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
      errorMsg: "Произошла ошибка. Пожалуйста, попробуйте еще раз."
    },
    en: { 
      title: "Contact Us", 
      subtitle: "CONTACT", 
      send: "Send Message",
      addressLabel: "Address",
      addressValue: "Khorezm region, Urgench city, Amir Temur street, 1A",
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
      addressValue: "Xorazm viloyati, Urganch shahri, Amir Temur ko'chasi, 1A uy",
      phoneLabel: "Telefon",
      timeLabel: "Ish vaqti",
      timeValue: "Har kuni 09:00 dan 18:00 gacha",
      namePlaceholder: "Ismingiz",
      nameValue: "Ali Valiyev",
      msgPlaceholder: "Xabaringiz",
      msgValue: "Qo'shimcha savollaringiz bo'lsa yozing...",
      successMsg: "Xabaringiz yuborildi! Tez orada siz bilan bog'lanamiz.",
      errorMsg: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
  };

  // Admin sozlagan aloqa ma'lumotlari (bo'sh bo'lsa — til bo'yicha standart matn)
  const phoneVal = phone || '+998 91 011 66 66';
  const addressVal = address || t.addressValue;
  const hoursVal = hours || t.timeValue;
  const telHref = 'tel:' + phoneVal.replace(/[^\d+]/g, '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const res = await submitContact(formData);
    
    if (res.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(res.error || t.errorMsg);
    }
    
    setLoading(false);
  };

  return (
    <section id="contact" className="py-32 px-6 bg-primary relative overflow-hidden">
      {/* Abstract Map Background */}
      <div className="absolute inset-0 z-0 opacity-10">
         <img src="/voha-actual-bg.png" className="w-full h-full object-cover blur-sm" alt="map bg" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-40 z-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="max-container relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="eyebrow eyebrow--center mb-5">{t.subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{t.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
           
           <div className="lg:col-span-2 space-y-10">
             <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0 border border-accent/30 shadow-[0_0_15px_rgba(250,218,165,0.2)] hover:bg-accent/30 hover:scale-105 transition-all duration-300">
                   <MapPin className="text-accent" size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-white mb-2">{t.addressLabel}</h4>
                   <p className="text-white/60 leading-relaxed">{addressVal}</p>
                </div>
             </div>
             
             <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0 border border-accent/30 shadow-[0_0_15px_rgba(250,218,165,0.2)] hover:bg-accent/30 hover:scale-105 transition-all duration-300">
                   <Phone className="text-accent" size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-white mb-2">{t.phoneLabel}</h4>
                   <a href={telHref} className="text-white/60 text-xl font-medium tracking-wide hover:text-accent transition-colors">{phoneVal}</a>
                </div>
             </div>

             <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0 border border-accent/30 shadow-[0_0_15px_rgba(250,218,165,0.2)] hover:bg-accent/30 hover:scale-105 transition-all duration-300">
                   <Clock className="text-accent" size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-white mb-2">{t.timeLabel}</h4>
                   <p className="text-white/60">{hoursVal}</p>
                </div>
             </div>
           </div>

           <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                 {success && (
                   <div className="bg-success/20 text-green-300 border border-success/30 p-4 rounded-xl flex items-center gap-3">
                     <CheckCircle2 size={20} />
                     <p className="font-medium text-sm">{t.successMsg}</p>
                   </div>
                 )}
                 {error && (
                   <div className="bg-danger/20 text-red-300 border border-danger/30 p-4 rounded-xl font-medium text-sm">
                     {error}
                   </div>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-white/70 uppercase tracking-wider">{t.namePlaceholder}</label>
                       <input name="name" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors" placeholder={t.nameValue} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-white/70 uppercase tracking-wider">{t.phoneLabel}</label>
                       <input name="phone" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors" placeholder={phoneVal} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">{t.msgPlaceholder}</label>
                    <textarea name="message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors resize-none" placeholder={t.msgValue}></textarea>
                 </div>
                 <button disabled={loading} type="submit" className="w-full py-4 bg-accent text-primary font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(250,218,165,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex justify-center items-center gap-3 disabled:opacity-50">
                    {loading ? 'Yuborilmoqda...' : t.send} {!loading && <Send size={18} />}
                 </button>
              </form>
           </div>
        </div>
      </div>
    </section>
  );
}
