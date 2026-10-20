/*
  "Uyingizni toping" o'yiniga o'tish. O'yin shu sahifada bo'lsa (bosh sahifa, xonadonlar) —
  sahifadan chiqmasdan Lenis orqali silliq tushadi (native smooth scroll Lenis bilan to'qnashadi).
  Bo'lmasa — false qaytaradi va havola odatdagidek bosh sahifaga olib boradi.
*/
export const QUEST_ID = 'uy-tanlash';

export function scrollToQuest(): boolean {
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
