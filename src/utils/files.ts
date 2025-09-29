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

// Generic function to create a file
const createFile = (
  filepath: string, // Relative path within the "src" folder, including the filename and extension
  content: string = "This is your new file. Please edit it.",
  frontmatter?: Frontmatter // Optional frontmatter
): string => {
  const filePath = path.join(process.cwd(), "src", filepath); // Resolve the absolute path
  const directory = path.dirname(filePath); // Get the directory path

  // Ensure the directory exists
  fs.mkdirSync(directory, { recursive: true });

  // Create the file if it doesn't already exist
  if (!fs.existsSync(filePath)) {
    let fileContent = content;

    // Add frontmatter at the start of the file if provided
    if (frontmatter) {
      const frontmatterString = generateFrontmatter(frontmatter);
      fileContent = `${frontmatterString}\n${content}`;
    }

    fs.writeFileSync(filePath, fileContent, "utf8");
  }

  return filePath; // Return the absolute path of the created file
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

// Function to provide all the files in a directory (recursively) to list assets
// In a relative path of a directory ("such as /public" or /src/assets" for instance
async function listFilesInDirectory(
  relativeDirPath: string
): Promise<string[]> {
  const dirPath = getFilePath(relativeDirPath);

  const filesList: string[] = [];

  async function readDirRecursively(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await readDirRecursively(fullPath); // Recurse into subdirectory
      } else {
        // Store the path relative to the provided directory
        filesList.push(path.relative(dirPath, fullPath));
      }
    }
  }

  await readDirRecursively(dirPath);
  return filesList;
}

// Delete a file and inform if successful
const deleteFile = (filePath: string): boolean => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

export {
  createFile,
  getFilePath,
  updateFile,
  deleteFile,
  readFile,
  resolveMdxFilePath,
  fileExists,
  listFilesInDirectory,
};
