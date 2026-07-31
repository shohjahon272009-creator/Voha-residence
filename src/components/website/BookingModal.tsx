 
 
 
 
 
'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Apartment } from '@/lib/types';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { submitPriceRequest } from '@/lib/contactActions';

export default function BookingModal({ 
  apartment, 
  lang, 
  onClose 
}: { 
  apartment: Apartment, 
  lang: Locale, 
  onClose: () => void 
}) {
  const dict = getDictionary(lang);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('apartmentId', apartment.id.toString());
    
    const res = await submitPriceRequest(formData);
    
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Xatolik yuz berdi.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center animate-fade-in">
             <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-6">
                <CheckCircle size={48} />
             </div>
             <h3 className="text-2xl font-bold text-primary mb-4">{dict.booking.success}</h3>
             <p className="text-gray-400 mb-8">Tez orada menejerlarimiz siz bilan bog&apos;lanishadi.</p>
             <button 
               onClick={() => {
                 onClose();
                 window.location.reload(); // Reload to show updated status
               }}
               className="px-10 py-4 bg-primary text-white font-bold rounded-xl w-full"
             >
               Yopish
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10">
            <h3 className="text-2xl font-bold text-primary mb-2">Narxini bilish</h3>
            <p className="text-gray-400 text-sm mb-8">№ {apartment.number} xonadon, {apartment.floor}-qavat. Telefon raqamingizni qoldiring, narxini aytamiz!</p>
            
            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{dict.booking.form.name}</label>
                  <input name="name" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" placeholder="F.I.SH (Ixtiyoriy)" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{dict.booking.form.phone} *</label>
                  <input name="phone" type="tel" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" placeholder="+998" />
               </div>
               {/* Hidden payment type to reuse the same backend action smoothly */}
               <input type="hidden" name="paymentType" value="Narxini bilish (Lead)" />
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Qo&apos;shimcha xabar (ixtiyoriy)</label>
                  <textarea name="message" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white resize-none" placeholder="O&apos;z xohish va takliflaringizni yozib qoldiring..."></textarea>
               </div>
               
               <div className="pt-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 hover:bg-primary transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Narxini bilish"}
                  </button>
               </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
