import type { NextConfig } from "next";

const EXTERNAL_API =
  process.env.EXTERNAL_API_URL ||
  "https://fitness-daily-tracker-backend-main.vercel.app";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  async rewrites() {
    return [
      {
        source: "/api/money/:path*",
        destination: `${EXTERNAL_API}/api/money/:path*`,
      },
      {
        source: "/api/lending-stats",
        destination: `${EXTERNAL_API}/api/lending-stats`,
      },
      {
        source: "/api/learning/:path*",
        destination: `${EXTERNAL_API}/api/learning/:path*`,
      },
      {
        source: "/api/score-sections/:path*",
        destination: `${EXTERNAL_API}/api/score-sections/:path*`,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
