// Runtime (packaged app) static data generator – no TypeScript, no ts-node needed.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// If ESM context, emulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy import of the runtime pages util (adjust path if needed)
async function getAllRuntimePagesSafe() {
  try {
    const mod = await import("./runtime-pages.js").catch(async () => {
      // If only TS exists (dev), try TS file (ts-node case)
      return import("./runtime-pages.ts");
    });
    return await mod.getAllRuntimePages();
  } catch (e) {
    console.error(
      "[generate-static-data.runtime] Failed to load runtime-pages:",
      e
    );
    return [];
  }
}

async function run() {
  console.log("[generate-static-data.runtime] Starting generation...");
  const pages = await getAllRuntimePagesSafe();
  const contents = Array.isArray(pages)
    ? pages.filter(
        (p) =>
          p &&
          p._raw &&
          typeof p._raw.flattenedPath === "string" &&
          p._raw.flattenedPath.startsWith("contents/")
      )
    : [];

  // Ensure src/data exists
  const dataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const moduleContent = `// Auto-generated - DO NOT EDIT
const pages = ${JSON.stringify(pages, null, 2)};
const contents = ${JSON.stringify(contents, null, 2)};
export const getAllPages = () => pages;
export const getAllContents = () => contents;
`;
  fs.writeFileSync(path.join(dataDir, "static-data.ts"), moduleContent, "utf8");

  // Also emit JSON (optional)
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDir, "static-contents.json"),
    JSON.stringify(contents, null, 2),
    "utf8"
  );

  console.log(
    `[generate-static-data.runtime] Done. pages=${pages.length} contents=${contents.length}`
  );
}

run().catch((e) => {
  console.error("[generate-static-data.runtime] Fatal error:", e);
  process.exit(1);
});
