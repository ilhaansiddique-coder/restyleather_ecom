import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";

const root = resolve(process.cwd(), "..");
let rootEnv: Record<string, string> = {};
try {
  rootEnv = parse(readFileSync(resolve(root, ".env")));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const port = process.env.BACKEND_PORT ?? rootEnv.BACKEND_PORT ?? "3001";
const backendOrigin = new URL(process.env.BACKEND_ORIGIN ?? rootEnv.BACKEND_ORIGIN ?? "http://127.0.0.1:" + port).origin;
process.env.BACKEND_ORIGIN = backendOrigin;
const storefrontUrl = process.env.STOREFRONT_URL ?? rootEnv.STOREFRONT_URL ?? process.env.APP_ORIGIN ?? rootEnv.APP_ORIGIN;
if (storefrontUrl) process.env.STOREFRONT_URL = storefrontUrl;

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  async redirects() {
    return [
      { source: "/logo.png", destination: "/logo.webp", permanent: true },
      { source: "/favicon.png", destination: "/favicon.webp", permanent: true },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: backendOrigin + "/api/:path*" }];
  },
};

export default nextConfig;
