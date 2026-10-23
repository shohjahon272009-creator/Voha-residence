 
 
 
 
 
'use server';
import { requireAdmin } from './requireAdmin';

export async function translateText(text: string, from: string, to: string) {
  await requireAdmin();
  if (!text || text.trim() === '') return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    // Javob gaplar bo'yicha bo'linadi — barchasini birlashtiramiz (avval faqat birinchi gap qolardi)
    if (!Array.isArray(data?.[0])) return '';
    return (data[0] as unknown[]).map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : '')).join('');
  } catch (error) {
    console.error("Translation error:", error);
    return '';
  }
}
