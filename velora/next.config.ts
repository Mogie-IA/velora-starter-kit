import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", process.env.REPLIT_DEV_DOMAIN ?? ""],
    },
  },
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN ?? "",
    "*.replit.dev",
    "*.janeway.replit.dev",
  ],
};

export default nextConfig;
