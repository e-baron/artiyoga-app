import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";
import path from "path";

console.log("Environment:", process.env.NODE_ENV);

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  // distDir: process.env.NODE_ENV === "production" ? ".next-gh-pages" : ".next",
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    root: __dirname,
  },
  appDir: true,
};

export default withContentlayer(nextConfig);
