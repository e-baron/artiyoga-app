import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";
import siteConfig from "@/config/site-config.json";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isDev ? "" : siteConfig.basePath,

  experimental: {
    globalNotFound: true,
  },
};

export default withContentlayer(nextConfig);
