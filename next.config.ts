import type { NextConfig } from "next";
import siteConfig from "@/config/site-config.json";
import { isDev } from "@/utils/env";
import path from 'path';


const nextConfig: NextConfig = {
  // output: "standalone",
  // output: "export",
  // outputFileTracingRoot: path.resolve(__dirname),
  output:
    process.env.NEXT_PUBLIC_GITHUB_PAGES_BUILD === "true"
      ? "export"
      : undefined,
  basePath: isDev() ? "" : siteConfig.basePath,

  experimental: {
    globalNotFound: true,
  },
  // outputFileTracingRoot: process.cwd(),

  env: {
    FORCE_DEV: process.env.FORCE_DEV, // available at build time (and runtime in server-side code)
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV, // available at build time and runtime in both server and client-side code
    NEXT_PUBLIC_GITHUB_PAGES_BUILD: process.env.NEXT_PUBLIC_GITHUB_PAGES_BUILD, // available at build time and runtime in both server and client-side code
  },
};

export default nextConfig;
