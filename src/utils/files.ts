import fs from "fs";
import path from "path";

// Function to create the file and its directories
const createFile = (sanitizedPagename: string, mdxPageDirectory: string) => {
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
    fs.writeFileSync(
      filePath,
      "This is your new page. Please edit it.",
      "utf8"
    );
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

export { createFile, getFilePath, updateFile, readFile };
