import { getAllRuntimePages } from "./runtime-pages";
import fs from "fs";
import path from "path";

async function generateStaticData() {
  const pages = await getAllRuntimePages();

  // Create public/data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write pages data to JSON file
  fs.writeFileSync(
    path.join(dataDir, "pages.json"),
    JSON.stringify(pages, null, 2)
  );

  console.log("Static data generated successfully");
}

generateStaticData().catch(console.error);
