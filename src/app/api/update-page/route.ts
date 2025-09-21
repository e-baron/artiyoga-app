import { NextResponse } from "next/server";
import { getFilePath, readFile, updateFile } from "@/utils/files";
import { handleGitFileCommit } from "@/utils/git";

export async function POST(request: Request) {
  try {
    const { action, slug, code } = await request.json();

    // Resolve the file path (either slug.mdx or slug/index.mdx)
    const filePath = await resolveFilePath(slug);

    if (action === "read") {
      // Read the file content
      const fileContent = readFile(filePath);
      return NextResponse.json({ code: fileContent });
    }

    if (action === "update") {
      // Update the file content
      updateFile(filePath, code);
      handleGitFileCommit(filePath, "update");
      return NextResponse.json({ message: "File updated successfully" });
    }

    // If action is not recognized
    return NextResponse.json(
      { error: "Invalid action. Use 'read' or 'update'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          "An error occurred while processing the request. " + errorMessage,
      },
      { status: 500 }
    );
  }
}

// Utility function to resolve the file path
async function resolveFilePath(slug: string): Promise<string> {
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
