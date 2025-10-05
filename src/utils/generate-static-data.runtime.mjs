import { log } from "console";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Function to log messages in all modes... 
TODO : see if we can import this !*/
const logMessage = (message, mode) => {
  // Add a timestamp to the message
  const now = new Date();
  const timestamp = now.toLocaleString();
  message = `[${timestamp}] ${message}`;

  const logPath = path.join(getProjectRoot(), "log.txt");

  switch (mode) {
    case "console":
      console.log(message);
      break;
    case "file":
      fs.appendFileSync(logPath, message + "\n");
      break;
    case "both":
      console.log(message);
      fs.appendFileSync(logPath, message + "\n");
      break;
  }
};

const getProjectRoot = () => {
  const currentDir =
    typeof __dirname !== "undefined"
      ? __dirname
      : path.dirname(fileURLToPath(import.meta.url));

  const repoDir =
    typeof process !== "undefined" && process.resourcesPath
      ? path.join(process.resourcesPath, "app")
      : path.resolve(currentDir, "..");

  return repoDir;
};

// Find the project root (parent of "src" or containing package.json)
function findProjectRoot(startDir = __dirname) {
  let dir = path.resolve(startDir);
  while (true) {
    if (
      fs.existsSync(path.join(dir, "src")) ||
      fs.existsSync(path.join(dir, "package.json"))
    ) {
      logMessage(`[static-data] Found project root: ${dir}`, "both");
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // fallback
  logMessage(
    `[static-data] Project root not found, falling back to CWD ${process.cwd()}`,
    "both"
  );
  return process.cwd();
}
const projectRoot = findProjectRoot();
logMessage(
  `[static-data] What could be the project root: ${projectRoot}`,
  "both"
);

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
    // Try JS first, then TS
    // const jsPath = path.join(projectRoot, "src", "utils", "runtime-pages.js");
    const jsPath = path.join(__dirname, "runtime-pages.js");
    logMessage(
      `[static-data] Looking for runtime pages... at ${jsPath}`,
      "both"
    );
    if (exists(jsPath)) {
      logMessage(`[static-data] Found runtime pages JS file ${jsPath}`, "both");
      const m = await dynamicImport(jsPath);
      return await m.getAllRuntimePages();
    }
    // const tsPath = path.join(projectRoot, "src", "utils", "runtime-pages.ts");
    const tsPath = path.join(process.cwd(), "src", "utils", "runtime-pages.ts");

    logMessage(
      `[static-data] Looking for runtime pages... at ${tsPath}`,
      "both"
    );
    if (exists(tsPath)) {
      logMessage(`[static-data] Found runtime pages TS file ${tsPath}`, "both");
      const m = await dynamicImport(tsPath);
      return await m.getAllRuntimePages();
    }
  } catch (e) {
    console.error("[static-data] runtime-pages load error:", e);
    logMessage(`[static-data] runtime-pages load error:: ${e}`, "both");
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

  // const dataDir = path.join(projectRoot, "src", "data");
  // WRITING AT THE RIGHT PLACE ?
  const dataDir = path.join(process.cwd(), "src", "data");

  logMessage(`[static-data] Writing to ${dataDir}`, "both");
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

  // const publicDir = path.join(projectRoot, "public");
  const publicDir = path.join(process.cwd(), "public");
  logMessage(`[static-data] Also checking public directory: ${publicDir}`, "both");
  if (!exists(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  writeAtomic(
    path.join(publicDir, "static-contents.json"),
    JSON.stringify(contents, null, 2)
  );

  console.log(`[static-data]wrote in ${dataDir} and ${publicDir}`);

  logMessage(
    `[static-data] Done pages=${pages.length} contents=${contents.length}`,
    "both"
  );
}

run().catch((e) => {
  console.error("[static-data] Fatal:", e);
  logMessage(`[static-data] Fatal: ${e}`, "both");
  process.exit(1);
});
