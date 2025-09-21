import { NextResponse } from "next/server";
import { createFile } from "@/utils/files";
import { handleGitFileCommit } from "@/utils/git";
import { Frontmatter } from "@/types";

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

    const frontmatter: Frontmatter = {
      // Add a capitalized title by default
      title: sanitizedPagename.charAt(0).toUpperCase() + pagename.slice(1),
      description: `This is the ${pagename} page.`,
      autoMargin: true,
      autoCropPage: true,
      published: false,
    };

    // Create the file
    const filePath = createFile(
      sanitizedPagename,
      "mdxPages",
      "This is your new page. Please edit it.",
      frontmatter
    );

    // Handle Git operations
    handleGitFileCommit(filePath, "add");

    return NextResponse.json({
      message: `Page "${sanitizedPagename}" created successfully!`,
    });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      {
        message:
          "An error occurred while creating the page." +
          (error instanceof Error ? " " + error.message : ""),
      },
      { status: 500 }
    );
  }
}
