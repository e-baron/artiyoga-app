import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.NEXT_PUBLIC_NEXT_DIST_DIR === ".next-gh-pages";
console.log("Is GitHub Pages Build:", process.env.NEXT_PUBLIC_NEXT_DIST_DIR);
console.log("Environment:", process.env.NODE_ENV);

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  distDir: isGitHubPagesBuild ? ".next-gh-pages" : ".next",
  experimental: {
    globalNotFound: true,
  },
};

export default withContentlayer(nextConfig);
