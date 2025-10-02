import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";
import siteConfig from "@/config/site-config.json";
import { isDev } from "@/utils/env";

const nextConfig: NextConfig = {
  // output: "standalone",
  basePath: isDev() ? "" : siteConfig.basePath,

  experimental: {
    globalNotFound: true,
  },

  env: {
    FORCE_DEV: process.env.FORCE_DEV, // available at build time (and runtime in server-side code)
  },
  images: {
    // Prior to use Sharp for image optimization, we disable the built-in Next.js image optimization
    unoptimized: true,
  },
};

export default withContentlayer(nextConfig);
