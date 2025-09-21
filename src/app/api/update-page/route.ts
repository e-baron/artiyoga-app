import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const mdxDirectory = path.join(process.cwd(), "src/mdxPages");

export async function POST(request: Request) {
  try {
    const { action, slug, code } = await request.json();

    if (action === "update") {
      let filePath = path.join(mdxDirectory, `${slug}.mdx`);
      // Ensure the file exists before updating
      try {
        await fs.access(filePath);
      } catch {
        // Check if the file exists as an index.mdx in a directory
        const dirPath = path.join(mdxDirectory, slug);
        const indexPath = path.join(dirPath, "index.mdx");
        try {
          await fs.access(indexPath);
          // If it exists, update the filePath to point to index.mdx
          filePath = indexPath;
        } catch {
          return NextResponse.json(
            { error: "File not found." },
            { status: 404 }
          );
        }
      }
      console.log("Updating file at:", filePath);
      await fs.writeFile(filePath, code, "utf8");
      return NextResponse.json({ message: "File updated successfully" });
    }

    if( action === "read" ) {
      let filePath = path.join(mdxDirectory, `${slug}.mdx`);
      // Ensure the file exists before reading
      try {
        await fs.access(filePath);
      } catch {
        // Check if the file exists as an index.mdx in a directory
        const dirPath = path.join(mdxDirectory, slug);
        const indexPath = path.join(dirPath, "index.mdx");
        try {
          await fs.access(indexPath);
          // If it exists, update the filePath to point to index.mdx
          filePath = indexPath;
        } catch {
          return NextResponse.json(
            { error: "File not found." },
            { status: 404 }
          );
        }
      }
      console.log("Reading file at:", filePath);
      const fileContent = await fs.readFile(filePath, "utf8");
      return NextResponse.json({ code: fileContent });
    }

    // If action is not recognized
    return NextResponse.json(
      { error: "Invalid action. Use 'update'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "An error occurred while processing the request." + errorMessage,
      },
      { status: 500 }
    );
  }
}
