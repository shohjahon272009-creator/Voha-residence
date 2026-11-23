import React from 'react';
import { faqJsonLd, ldString, type Faq } from '@/lib/faq';

// Ko'p beriladigan savollar: sahifada ochiladigan ro'yxat + qidiruv tizimlari uchun FAQPage ma'lumoti
export default function FaqSection({ lang, items }: { lang: string; items: Faq[] }) {
  const title = lang === 'ru' ? 'Частые вопросы' : lang === 'en' ? 'Frequently asked questions' : 'Ko‘p beriladigan savollar';
  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-container max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">{title}</h2>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {items.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold text-primary [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="text-2xl leading-none text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 pr-8 leading-relaxed text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldString(faqJsonLd(items)) }} />
    </section>
  );
}
