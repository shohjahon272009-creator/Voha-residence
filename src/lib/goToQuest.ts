/*
  "Uyingizni toping" o'yiniga o'tish. O'yin shu sahifada bo'lsa (bosh sahifa, xonadonlar) —
  sahifadan chiqmasdan Lenis orqali silliq tushadi (native smooth scroll Lenis bilan to'qnashadi).
  Bo'lmasa — false qaytaradi va havola odatdagidek bosh sahifaga olib boradi.
*/
export const QUEST_ID = 'uy-tanlash';

// Sahifadagi bo'limga (id) Lenis orqali tushish; topilmasa false
export function scrollToId(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

// <a href="/uz#about"> uchun: bo'lim shu sahifada bo'lsa — qayta yuklamasdan unga tushadi
export const onSectionLinkClick = (id: string) => (e: { preventDefault(): void }) => {
  if (scrollToId(id)) e.preventDefault();
};

export function scrollToQuest(): boolean {
  try { sessionStorage.setItem('voha_exit_shown', '1'); } catch { /* ignore */ }
  const el = document.getElementById(QUEST_ID);
  if (!el) return false;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

// <a>/<Link> onClick uchun: o'yin shu yerda bo'lsa navigatsiyani to'xtatadi
export function onQuestLinkClick(e: { preventDefault(): void }) {
  if (scrollToQuest()) e.preventDefault();
}
