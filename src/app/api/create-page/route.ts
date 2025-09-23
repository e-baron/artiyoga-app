import { NextResponse } from "next/server";
import { createFile, getFilePath, readFile, updateFile } from "@/utils/files";
import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { Frontmatter } from "@/types";
import { addUnpublishedPage } from "@/utils/config";

export async function POST(request: Request) {
  try {
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));
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
      // published: false, // By default, the publishing state is linked to git and site-config
    };

    await handleUncommittedChangesAndSwitchToDev();

    // Create the file
    const filePath = createFile(
      sanitizedPagename,
      "mdxPages",
      "This is your new page. Please edit it.",
      frontmatter
    );

    // Update the site-config.json to add the new page to unpublishedPages
    const updatedSiteConfig = addUnpublishedPage(siteConfig, {
      name: sanitizedPagename,
      operation: "add",
    });
    updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));

    // Handle Git operations
    await handleGitFileCommit(filePath, "add");

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
