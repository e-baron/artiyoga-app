import { NextResponse } from "next/server";
import { createFile } from "@/utils/files";
import { handleGitFileCommit } from "@/utils/git";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pagename } = body;

    if (!pagename) {
      return NextResponse.json(
        { message: "Pagename is required" },
        { status: 400 }
      );
    }

    // Sanitize the pagename
    const sanitizedPagename = pagename.replace(/[^a-zA-Z0-9-_\/]/g, "");

    // Create the file
    const filePath = createFile(sanitizedPagename, "mdxPages");

    // Handle Git operations
    handleGitFileCommit(filePath, sanitizedPagename);

    return NextResponse.json({
      message: `Page "${sanitizedPagename}" created successfully!`,
    });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the page." },
      { status: 500 }
    );
  }
}
