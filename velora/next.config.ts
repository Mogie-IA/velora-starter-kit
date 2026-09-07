import type { NextConfig } from "next";

// Production deployment domains (comma-separated), e.g. "myapp.replit.app".
// Required so Next.js server actions accept requests behind the Replit proxy
// in production — without these the deployed sign-in / payment actions would be
// rejected as cross-origin.
const replitDomains = (process.env.REPLIT_DOMAINS ?? "")
  .split(",")
  .map((domain) => domain.trim())
  .filter(Boolean);

// Vercel supplies these as bare hostnames (no protocol), which is the shape
// `allowedOrigins` expects. VERCEL_URL is the immutable per-deployment host,
// VERCEL_BRANCH_URL the per-branch preview host, and
// VERCEL_PROJECT_PRODUCTION_URL the stable production host. Listing all three
// keeps server actions working on preview deployments as well as production.
const vercelDomains = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
].filter((domain): domain is string => Boolean(domain));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        process.env.REPLIT_DEV_DOMAIN ?? "",
        ...replitDomains,
        ...vercelDomains,
      ].filter(Boolean),
    },
  },
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN ?? "",
    ...replitDomains,
    "*.replit.dev",
    "*.janeway.replit.dev",
    "*.replit.app",
  ].filter(Boolean),
};

export default nextConfig;
