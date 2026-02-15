import type { NextConfig } from "next";

// next-pwa removed due to incompatibility with Workbox 8 / Next.js 16
// TODO: Migrate to @ducanh2912/next-pwa or Serwist

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Next.js 16 Turbopack
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
