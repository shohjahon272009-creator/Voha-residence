import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // /api/media va /api/apt-image — loyiha, yangilik va xonadon rasmlari (Google Images ko'rsin)
        allow: ['/', '/api/media', '/api/apt-image/'],
        disallow: ['/admin/', '/api/admin/', '/api/export'],
      },
    ],
    sitemap: 'https://www.voharesidence.uz/sitemap.xml',
  };
}
