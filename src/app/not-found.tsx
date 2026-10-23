import Link from 'next/link';
import VohaLogo from '@/components/common/VohaLogo';

/*
  Brendlangan 404 — noto'g'ri manzil, o'chirilgan loyiha/yangilik. Til noma'lum bo'lishi
  mumkin, shuning uchun uchala tilda qisqa matn va har tilga havola.
*/
export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-primary text-white flex flex-col items-center justify-center px-6 text-center">
      <VohaLogo className="h-12 w-auto mb-12" />
      <div className="font-montserrat font-extrabold text-[clamp(5rem,18vw,10rem)] leading-none text-accent">404</div>
      <h1 className="mt-6 text-2xl md:text-3xl font-extrabold">Sahifa topilmadi</h1>
      <p className="mt-2 text-white/60">Страница не найдена · Page not found</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/uz" className="px-7 py-3.5 rounded-full bg-accent text-primary font-bold hover:bg-white transition-colors">Bosh sahifa</Link>
        <Link href="/ru" className="px-7 py-3.5 rounded-full border border-white/30 font-bold hover:bg-white hover:text-primary transition-colors">Главная</Link>
        <Link href="/en" className="px-7 py-3.5 rounded-full border border-white/30 font-bold hover:bg-white hover:text-primary transition-colors">Home</Link>
      </div>
      <Link href="/uz/apartments" className="mt-8 text-sm text-white/60 underline underline-offset-4 hover:text-white">
        Xonadonlarni ko&apos;rish · Квартиры · Apartments
      </Link>
    </main>
  );
}
