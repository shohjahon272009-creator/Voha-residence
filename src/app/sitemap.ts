import { MetadataRoute } from 'next';
import { getProjects } from '@/lib/actions';
import db from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.voharesidence.uz';
  const langs = ['uz', 'ru', 'en'];

  // Asosiy sahifalar
  const staticPages = [
    '',
    '/apartments',
    '/about',
    '/projects',
    '/news',
    '/contact',
  ];

  const staticRoutes: MetadataRoute.Sitemap = [];

  for (const lang of langs) {
    for (const page of staticPages) {
      staticRoutes.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Loyiha sahifalari
  const projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getProjects();
    for (const project of projects) {
      for (const lang of langs) {
        projectRoutes.push({
          url: `${baseUrl}/${lang}/projects/${project.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // DB unavailable
  }

  // Yangilik sahifalari (faqat ko'rinadiganlar)
  const newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const news = await db.prepare('SELECT id, date FROM news WHERE visible = 1').all() as { id: number; date: string }[];
    for (const n of news) {
      for (const lang of langs) {
        newsRoutes.push({
          url: `${baseUrl}/${lang}/news/${n.id}`,
          // Noto'g'ri sana 'Invalid Date' bo'lsa sitemap 500 bilan yiqilardi
          lastModified: n.date && !isNaN(new Date(n.date).getTime()) ? new Date(n.date) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB unavailable
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...staticRoutes,
    ...projectRoutes,
    ...newsRoutes,
  ];
}
