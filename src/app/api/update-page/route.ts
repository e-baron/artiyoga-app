import { NextResponse } from "next/server";
import { getFilePath, readFile, updateFile, resolveMdxFilePath } from "@/utils/files";
import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { addUnpublishedPage } from "@/utils/config";

export async function POST(request: Request) {
  try {
    const { action, slug, code } = await request.json();
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));

    // Resolve the file path (either slug.mdx or slug/index.mdx)
    const filePath = await resolveMdxFilePath(slug);

    if (action === "read") {
      // Read the file content
      const fileContent = readFile(filePath);
      return NextResponse.json({ code: fileContent });
    }

    if (action === "update") {
      // Update the file content
      await handleUncommittedChangesAndSwitchToDev();
      updateFile(filePath, code);

      // Update the site-config.json to add the new page to unpublishedPages
      const updatedSiteConfig = addUnpublishedPage(siteConfig, {
        name: slug,
        operation: "edit",
      });
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));

      await handleGitFileCommit(siteConfigPath, "update");
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


