import { Frontmatter } from "@/types";
import fs from "fs";
import path from "path";
import fse from "fs-extra";
import siteConfig from "@/config/site-config.json";
import { execSync } from "child_process";

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
  filepath: string, // Relative path within the root folder, including the filename and extension
  content: string = "This is your new file. Please edit it.",
  frontmatter?: Frontmatter // Optional frontmatter
): string => {
  const filePath = path.join(process.cwd(), filepath); // Resolve the absolute path
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

const createFileFromBlob = async (
  filepath: string, // Relative path within the root folder, including the filename and extension
  blob: Blob
): Promise<string> => {
  const filePath = path.join(process.cwd(), filepath); // Resolve the absolute path
  const directory = path.dirname(filePath); // Get the directory path

  // Ensure the directory exists
  fs.mkdirSync(directory, { recursive: true });

  // Create the file if it doesn't already exist
  if (!fs.existsSync(filePath)) {
    const buffer = Buffer.from(await blob.arrayBuffer()); // Convert Blob to Buffer
    fs.writeFileSync(filePath, buffer); // Write the buffer to the file
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

// Function to delete a directory and all its contents
const deleteDirectory = (dirPath: string): boolean => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }
  return false;
};

/**
 * Copies all project files to a new directory, including `.env.production` and `.nojekyll`.
 * @param targetDir The target directory where files will be copied.
 */
const copyProjectFiles = (targetDir: string) => {
  // Please use the git checkout-index command to copy only tracked files
  try {
    // Ensure the target directory exists
    fs.mkdirSync(targetDir, { recursive: true });
    // Use git checkout-index to copy only tracked files
    execSync(`git checkout-index --all --prefix=${targetDir}/`, {
      stdio: "inherit", // Inherit stdio to see command output
    });

    // Add `.env.production` and `.nojekyll` to the target directory
    const additionalFiles = [".env.production", ".nojekyll"];
    additionalFiles.forEach((file) => {
      const src = path.resolve(file);
      const dest = path.join(targetDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      } else {
        console.warn(`Optional file ${file} not found. Skipping...`);
      }
    });

    console.log(`All project files copied to ${targetDir}`);
  } catch (error) {
    console.error("Error copying project files:", error);
    throw new Error(
      `Failed to copy project files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Function to copy additional project files to a new directory, such as `.env.production` and `.nojekyll` given in a table
const copyAdditionalProjectFiles = (
  targetDir: string,
  files: string[] = [".env.production", ".nojekyll"]
) => {
  try {
    // Ensure the target directory exists
    fs.mkdirSync(targetDir, { recursive: true });

    files.forEach((file) => {
      const src = path.resolve(file);
      const dest = path.join(targetDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      } else {
        console.warn(`Optional file ${file} not found. Skipping...`);
      }
    });

    console.log(`Additional project files copied to ${targetDir}`);
  } catch (error) {
    console.error("Error copying additional project files:", error);
    throw new Error(
      `Failed to copy additional project files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Copies files and directories from the source to the destination.
 * @param src The source directory.
 * @param dst The destination directory.
 * @param dereference If true, symlinks are followed. Defaults to false.
 * If false, symlinks are copied as symlinks (recommended for node_modules).
 * @returns void
 */
function copyDir(src: string, dst: string, dereference = false) {
  // Check if the source exists and is a directory
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    console.warn(`Source path ${src} is not a valid directory. Skipping copy.`);
    return;
  }
  try {
    fse.copySync(src, dst, { dereference });
  } catch (error) {
    console.error(`Failed to copy directory from ${src} to ${dst}.`, error);
    throw error; // Re-throw the error to stop the process
  }
}

const updateFileName = (oldPath: string, newPath: string) => {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    return true;
  }
  return false;
};

export {
  createFile,
  createFileFromBlob,
  getFilePath,
  updateFile,
  deleteFile,
  readFile,
  resolveMdxFilePath,
  fileExists,
  listFilesInDirectory,
  deleteDirectory,
  copyProjectFiles,
  copyAdditionalProjectFiles,
  copyDir,
  updateFileName,
};
