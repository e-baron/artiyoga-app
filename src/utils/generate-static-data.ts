import { getAllRuntimePages } from "./runtime-pages";
import fs from "fs";
import path from "path";

async function generateStaticData() {
  const pages = await getAllRuntimePages();

  // Filter contents (pages that start with "contents/")
  const contents = pages.filter((page) =>
    page._raw?.flattenedPath?.startsWith("contents/")
  );

  // Create src/data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write as ES module
  const moduleContent = `// Auto-generated - do not edit
const pages = ${JSON.stringify(pages, null, 2)};

const contents = ${JSON.stringify(contents, null, 2)};

export const getAllPages = () => pages;
export const getAllContents = () => contents;
`;

  fs.writeFileSync(path.join(dataDir, "static-data.ts"), moduleContent);

  console.log("Static data generated successfully");
  console.log(`- Total pages: ${pages.length}`);
  console.log(`- Content pages: ${contents.length}`);
}

generateStaticData().catch(console.error);
