import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // CSS en línea en el HTML: sin solicitudes que bloqueen el primer render
    inlineCss: true,
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/photos/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
