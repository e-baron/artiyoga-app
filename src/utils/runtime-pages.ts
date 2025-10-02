import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const MDX_ROOT = path.join(process.cwd(), "src", "mdxPages");

export function resolveRuntimeMdxPath(slug: string) {
  const normalized = !slug || slug === "index" ? "index" : slug;
  const direct = path.join(MDX_ROOT, `${normalized}.mdx`);
  if (fs.existsSync(direct)) return direct;
  const nestedIndex = path.join(MDX_ROOT, normalized, "index.mdx");
  if (fs.existsSync(nestedIndex)) return nestedIndex;
  throw new Error(`MDX not found for slug: ${slug}`);
}

export function readRuntimePage(slug: string) {
  const filePath = resolveRuntimeMdxPath(slug || "index");
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    _raw: { flattenedPath: slug },
    slug,
    title: data.title || "",
    description: data.description || "",
    featuredImage: data.featuredImage,
    autoMargin: data.autoMargin ?? true,
    autoFeatureImageAndText: data.autoFeatureImageAndText ?? false,
    body: {
      raw,
      code: content,
    },
    ...data,
  };
}
