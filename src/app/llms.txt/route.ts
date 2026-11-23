import db from '@/lib/db';
import { getPublicSettings } from '@/lib/settings';
import { getContacts } from '@/lib/contacts';
import { getFaq } from '@/lib/faq';

/*
  /llms.txt — AI yordamchilar (ChatGPT, Claude, Perplexity va b.) uchun saytning qisqa, aniq tavsifi.
  Ma'lumot bazadan olinadi; narx, bo'sh xonadonlar soni, mijozlar va ichki ma'lumot yo'q.
*/
export const dynamic = 'force-dynamic';

const SITE = 'https://www.voharesidence.uz';

export async function GET() {
  const s = await getPublicSettings();
  const c = await getContacts();
  const hours = s.contact_hours || 'Har kuni 09:00 dan 18:00 gaça';
  const address = c.address || 'Urganç ş., Uluğbek köçasi — Ekstrenniy şifoxonasi çorrahasi';
  let projects: { id: number; name_uz: string; status: string; city: string | null }[] = [];
  try {
    projects = (await db.prepare('SELECT id, name_uz, status, city FROM projects ORDER BY name_uz').all()) as typeof projects;
  } catch { /* baza javob bermasa — loyihalar ro'yxatisiz */ }
  const selling = projects.filter((p) => p.status !== 'Topshirilgan');
  const done = projects.filter((p) => p.status === 'Topshirilgan');
  const faq = getFaq('uz', s, { phone: c.phone, phone2: c.phone2, address, hours });

  const lines = [
    '# Voha Residence',
    '',
    '> Voha Residence — Urganç şahridagi (Xorazm viloyati, Özbekiston) turar-joy quruvçi kompaniya. Sayt sotuvdagi xonadonlarni blok, qavat va xonalar soni böyiça tanlaş, tölovni hisoblaş va menejerga murojaat qoldiriş uçun.',
    '',
    '## Asosiy ma’lumot',
    `- Kompaniya: Voha Residence (quriliş kompaniyasi, developer)`,
    `- Joylaşuv: Urganç şahri, Xorazm viloyati, Özbekiston; bloklar Şovot kanali böyida`,
    `- Sotuv ofisi: ${address}`,
    `- Telefon: ${[c.phone, c.phone2].filter(Boolean).join(', ')}`,
    `- Iş vaqti: ${hours}`,
    `- Telegram: https://t.me/voharesidence · Instagram: https://www.instagram.com/voha_residence`,
    `- Sayt tillari: özbek (${SITE}/uz), rus (${SITE}/ru), ingliz (${SITE}/en)`,
    '- Xonadon narxi saytda körsatilmaydi: aniq narxni menejer aytadi.',
    '',
    '## Sahifalar',
    `- [Xonadonlar](${SITE}/uz/apartments): sotuvdagi xonadonlarni tanlaş va tölovni hisoblaş`,
    `- [Loyihalar](${SITE}/uz/projects): sotuvdagi va topşirilgan loyihalar`,
    `- [Biz haqimizda](${SITE}/uz/about): kompaniya tarixi`,
    `- [Yangiliklar](${SITE}/uz/news): yangiliklar va aksiyalar`,
    `- [Aloqa](${SITE}/uz/contact): sotuv ofisi manzili, telefon, savol-javoblar`,
    '',
    `## Sotuvdagi loyihalar (${selling.length} ta)`,
    ...selling.map((p) => `- [${p.name_uz}](${SITE}/uz/projects/${p.id}): ${p.city || 'Urganç'}`),
    '',
    `## Topşirilgan loyihalar (${done.length} ta)`,
    ...done.map((p) => `- [${p.name_uz}](${SITE}/uz/projects/${p.id})`),
    '',
    '## Köp beriladigan savollar',
    ...faq.flatMap((f) => [`### ${f.q}`, f.a, '']),
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
  });
}
