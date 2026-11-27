import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cyberledger/ui"],
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
