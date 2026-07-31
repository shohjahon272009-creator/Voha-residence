 
 
 
 
 
'use server';

export async function translateText(text: string, from: string, to: string) {
  if (!text || text.trim() === '') return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data[0][0][0] as string;
  } catch (error) {
    console.error("Translation error:", error);
    return '';
  }
}
