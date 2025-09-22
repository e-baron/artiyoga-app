import { Frontmatter } from "@/types";
import fs from "fs";
import path from "path";
import siteConfig from "@/config/site-config.json";

// Function to generate frontmatter string
const generateFrontmatter = (frontmatter: Frontmatter): string => {
  // Use default title and description from site-config if no frontmatter is provided
  const defaultFrontmatter: Frontmatter = {
    title: siteConfig.title,
    description: siteConfig.description,
  };

  // Merge provided frontmatter with defaults
  const finalFrontmatter = { ...defaultFrontmatter, ...frontmatter };

  // Generate the frontmatter string
  return `---\n${Object.entries(finalFrontmatter)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n---\n`;
};

// Function to create the file and its directories
const createFile = (
  sanitizedPagename: string,
  mdxPageDirectory: string,
  content: string = "This is your new page. Please edit it.",
  frontmatter: Frontmatter
) => {
  const filePath = path.join(
    process.cwd(),
    "src",
    mdxPageDirectory,
    `${sanitizedPagename}.mdx`
  );
  const directory = path.dirname(filePath);

  // Ensure the directory exists
  fs.mkdirSync(directory, { recursive: true });

  // Create the file if it doesn't already exist
  if (!fs.existsSync(filePath)) {
    const frontmatterString = generateFrontmatter(frontmatter);
    const fileContent = `${frontmatterString}\n${content}`;
    fs.writeFileSync(filePath, fileContent, "utf8");
  }

  return filePath;
};

// Provide relative project path (e.g. "src/mdxPages/yourpage.mdx") and returns absolute path
const getFilePath = (projectRelativePath: string) => {
  return path.join(process.cwd(), projectRelativePath);
};

const updateFile = (filePath: string, content: string) => {
  fs.writeFileSync(filePath, content, "utf8");
};

const readFile = (filePath: string): string => {
  return fs.readFileSync(filePath, "utf8");
};

// Utility function to resolve the file path
async function resolveMdxFilePath(slug: string): Promise<string> {
  const mdxDirectory = "src/mdxPages"; // Relative directory for MDX files
  const filePath = getFilePath(`${mdxDirectory}/${slug}.mdx`);
  const indexFilePath = getFilePath(`${mdxDirectory}/${slug}/index.mdx`);

  // Check if the file exists
  if (await fileExists(filePath)) {
    return filePath;
  }

  // Check if the index.mdx file exists in the directory
  if (await fileExists(indexFilePath)) {
    return indexFilePath;
  }

  throw new Error("File not found.");
}

// Utility function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fs = (await import("fs/promises")).default;
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export {
  createFile,
  getFilePath,
  updateFile,
  readFile,
  resolveMdxFilePath,
  fileExists,
};
