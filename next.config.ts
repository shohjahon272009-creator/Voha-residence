import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['better-sqlite3'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/uz',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
