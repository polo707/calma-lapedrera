import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // CSS en línea en el HTML: sin solicitudes que bloqueen el primer render
    inlineCss: true,
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
