'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/*
  Kutilmagan xato (masalan, baza vaqtincha javob bermadi) — oq ekran yoki Next'ning standart
  xatosi o'rniga brendlangan sahifa: qayta urinish va qo'ng'iroq qilish.
*/
const T: Record<string, { title: string; sub: string; retry: string; home: string; call: string }> = {
  uz: { title: 'Nimadir xato ketdi', sub: "Sahifa vaqtincha ochilmadi. Bir necha soniyadan keyin qayta urinib ko'ring.", retry: 'Qayta urinish', home: 'Bosh sahifa', call: "Qo'ng'iroq qilish" },
  ru: { title: 'Что-то пошло не так', sub: 'Страница временно недоступна. Попробуйте ещё раз через несколько секунд.', retry: 'Повторить', home: 'Главная', call: 'Позвонить' },
  en: { title: 'Something went wrong', sub: 'The page is temporarily unavailable. Please try again in a few seconds.', retry: 'Try again', home: 'Home', call: 'Call us' },
};

export default function LangError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang && T[params.lang] ? params.lang : 'uz';
  const t = T[lang];

  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="min-h-[100dvh] bg-primary text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold">{t.title}</h1>
      <p className="mt-4 text-white/70 max-w-md">{t.sub}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="px-7 py-3.5 rounded-full bg-accent text-primary font-bold hover:bg-white transition-colors">{t.retry}</button>
        <Link href={`/${lang}`} className="px-7 py-3.5 rounded-full border border-white/30 font-bold hover:bg-white hover:text-primary transition-colors">{t.home}</Link>
        <a href="tel:+998910116666" className="px-7 py-3.5 rounded-full border border-white/30 font-bold hover:bg-white hover:text-primary transition-colors">{t.call}</a>
      </div>
    </main>
  );
}
