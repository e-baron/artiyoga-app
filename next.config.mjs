import createMDX from "@next/mdx";
import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'


const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "export",
  images: {
    unoptimized: true, // Optimize images only if using a cloud solution
  },
  basePath: isProd ? '/artiyoga-new-arch' : undefined,
  assetPrefix: isProd ? '/artiyoga-new-arch/' : undefined,
};

export default withContentlayer(nextConfig);

/*
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // providerImportSource: "@mdx-js/react",
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
*/
