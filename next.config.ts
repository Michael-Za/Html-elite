import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/elite.html",
      },
    ];
  },
};

export default nextConfig;
