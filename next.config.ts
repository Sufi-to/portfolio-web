import type { NextConfig } from "next";

// Static export: the whole site is prerendered HTML + a small amount of JS,
// so it can be hosted anywhere (GitHub Pages, Cloudflare Pages, Vercel).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  agentRules: false,
};

export default nextConfig;
