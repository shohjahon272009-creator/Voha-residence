import { MetadataRoute } from 'next';

// AI yordamchilar va qidiruv botlari: sayt ularga ochiq (javoblarda Voha Residence to'g'ri ko'rinsin)
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'YandexBot', 'Bingbot'];

export default function robots(): MetadataRoute.Robots {
  // /api/media va /api/apt-image — loyiha, yangilik va xonadon rasmlari (Google Images ko'rsin)
  const allow = ['/', '/api/media', '/api/apt-image/'];
  const disallow = ['/admin/', '/api/admin/', '/api/export'];
  return {
    rules: [
      { userAgent: '*', allow, disallow },
      { userAgent: AI_BOTS, allow, disallow },
    ],
    sitemap: 'https://www.voharesidence.uz/sitemap.xml',
  };
}
