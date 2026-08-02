import { MetadataRoute } from 'next';
import { getProjects } from '@/lib/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://voharesidence.uz';
  const langs = ['uz', 'ru', 'en'];

  // Asosiy sahifalar
  const staticPages = [
    '',
    '/about',
    '/apartments',
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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...staticRoutes,
    ...projectRoutes,
  ];
}
