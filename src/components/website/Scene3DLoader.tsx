'use client';

import dynamic from 'next/dynamic';
import { Locale, getDictionary } from '@/lib/dictionaries';

// three.js faqat brauzerda ishlaydi — serverda render qilinmaydi (ssr: false faqat client komponentda mumkin)
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function Scene3DLoader({ lang, initialProject }: { lang: Locale; initialProject?: number }) {
  return (
    <>
      {/* JS yuklanguncha ham bo'sh ekran emas — matn; Scene3D o'z progress chizig'ini ustidan chizadi */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#dfe9e6]">
        <p className="text-primary font-bold">{getDictionary(lang).tour3d.loading}</p>
      </div>
      <Scene3D lang={lang} initialProject={initialProject} />
    </>
  );
}
