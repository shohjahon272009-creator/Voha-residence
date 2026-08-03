import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['better-sqlite3', '@libsql/client', 'libsql'],
  // Google va boshqa botlar /favicon.ico ni so'raydi — uni haqiqiy logoga yo'naltiramiz
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.jpg' }];
  },
};

export default nextConfig;
