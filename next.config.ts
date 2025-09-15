import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,

  experimental: {
    globalNotFound: true,
  },
};

export default withContentlayer(nextConfig);
