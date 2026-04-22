import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost',
    '.replit.dev',
    '.repl.co',
    '.replit.com',
  ],
  experimental: {
    // Enable if needed
  },
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // For Vercel deployment
  output: 'standalone',
};

export default nextConfig;
