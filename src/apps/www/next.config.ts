import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@secura/ui"],
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
