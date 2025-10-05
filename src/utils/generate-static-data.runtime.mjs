import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

async function dynamicImport(filePath) {
  return import(pathToFileURL(filePath).href);
}

async function getAllRuntimePagesSafe() {
  try {
    const jsPath = path.join(__dirname, "runtime-pages.js");
    if (exists(jsPath)) {
      const m = await dynamicImport(jsPath);
      return await m.getAllRuntimePages();
    }
    const tsPath = path.join(process.cwd(), "src", "utils", "runtime-pages.ts");
    if (exists(tsPath)) {
      const m = await dynamicImport(tsPath);
      return await m.getAllRuntimePages();
    }
  } catch (e) {
    console.error("[static-data] runtime-pages load error:", e);
  }
  return [];
}

function writeAtomic(targetPath, content) {
  const tmp = targetPath + ".tmp";
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, targetPath);
}

async function run() {
  console.log("[static-data] Generating (ESM)...");
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

  const dataDir = path.join(process.cwd(), "src", "data");
  if (!exists(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const moduleContent = `// Auto-generated - do not edit
/* eslint-disable */
const pages = ${JSON.stringify(pages, null, 2)};
const contents = ${JSON.stringify(contents, null, 2)};

export const getAllPages = () => pages;
export const getAllContents = () => contents;

export default { getAllPages, getAllContents, pages, contents };
`;
  writeAtomic(path.join(dataDir, "static-data.ts"), moduleContent);

  const publicDir = path.join(process.cwd(), "public");
  if (!exists(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  writeAtomic(
    path.join(publicDir, "static-contents.json"),
    JSON.stringify(contents, null, 2)
  );

  console.log(
    `[static-data] Done pages=${pages.length} contents=${contents.length}`
  );
}

run().catch((e) => {
  console.error("[static-data] Fatal:", e);
  process.exit(1);
});
