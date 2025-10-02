import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const MDX_ROOT = path.join(process.cwd(), "src", "mdxPages");

const resolveRuntimeMdxPath = (slug: string) => {
  const normalized = !slug || slug === "index" ? "index" : slug;
  const direct = path.join(MDX_ROOT, `${normalized}.mdx`);
  if (fs.existsSync(direct)) return direct;
  const nestedIndex = path.join(MDX_ROOT, normalized, "index.mdx");
  if (fs.existsSync(nestedIndex)) return nestedIndex;
  throw new Error(`MDX not found for slug: ${slug}`);
};

const readRuntimePage = (slug: string) => {
  const filePath = resolveRuntimeMdxPath(slug || "index");
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  console.log("READRUNTIME");
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
};

// Recursively walk and collect MDX slugs
function collectMdxSlugs(rootDir: string): string[] {
  const slugs: string[] = [];

  function walk(dir: string, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, prefix ? `${prefix}/${entry.name}` : entry.name);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;

      // Compute slug
      if (entry.name === "index.mdx") {
        // index.mdx at root => slug ""
        // nested index.mdx => slug = prefix
        const slug = prefix === "" ? "" : prefix;
        slugs.push(slug);
      } else {
        const base = entry.name.replace(/\.mdx$/, "");
        const slug = prefix ? `${prefix}/${base}` : base;
        slugs.push(slug);
      }
    }
  }

  walk(rootDir, "");
  // Deduplicate just in case and keep stable order
  return Array.from(new Set(slugs));
}

const getAllRuntimePages = () => {
  const slugs = collectMdxSlugs(MDX_ROOT);
  const pages = slugs
    .map((slug) => {
      try {
        return readRuntimePage(slug || "index");
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ReturnType<typeof readRuntimePage>[];
  return pages;
};

export { readRuntimePage, getAllRuntimePages };
