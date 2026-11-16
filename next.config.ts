import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Admin rasm yuklashi Server Action orqali — standart 1 MB chegarada galereya, 360° va yangilik
  // rasmlari "jim" yiqilib, oyna qotib qolardi (nginx'da ham client_max_body_size 25m)
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
  },
  serverExternalPackages: ['better-sqlite3', '@libsql/client', 'libsql'],
  // Xavfsizlik sarlavhalari: sayt begona sahifa ichiga joylanmaydi (clickjacking), faqat HTTPS,
  // brauzer fayl turini o'zi "taxmin" qilmaydi, tashqi saytlarga to'liq manzil yuborilmaydi
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=()' },
      ],
    }];
  },
  // Google va boshqa botlar /favicon.ico ni so'raydi — uni haqiqiy logoga yo'naltiramiz
  async rewrites() {
    return {
      // beforeFiles: eski src/app/page.tsx bor — oddiy rewrite fayldan keyin ishlab, "/" eski sahifani ko'rsatardi
      beforeFiles: [
        // Bosh manzil — o'zbekcha sahifa (ichki, URL o'zgarmaydi)
        { source: '/', destination: '/uz' },
      ],
      afterFiles: [{ source: '/favicon.ico', destination: '/icon.jpg' }],
      fallback: [],
    };
  },
};

export default nextConfig;
