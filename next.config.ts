import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['better-sqlite3', '@libsql/client', 'libsql'],
};

export default nextConfig;
