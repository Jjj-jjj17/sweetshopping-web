import type { NextConfig } from "next";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable in dev to avoid aggressive caching
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Basic runtime caching strategy if needed, next-pwa has defaults
  ],
  workboxOptions: {
    cleanupOutdatedCaches: true,
    clientsClaim: true,
  }
});

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for Phase 2 (Dynamic Routes)
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' }, // Careful if embedding
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
