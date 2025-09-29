import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.NEXT_DIST_DIR === ".next-gh-pages";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  distDir: isGitHubPagesBuild ? ".next-gh-pages" : ".next",
  experimental: {
    globalNotFound: true,
  },
};

export default withContentlayer(nextConfig);
