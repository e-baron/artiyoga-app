// Create a new POST endpoint to publish all unpublished items

import { NextResponse } from "next/server";
import { getFilePath, readFile, resolveMdxFilePath, updateFile } from "@/utils/files";
import { handleGitFileCommit, mergeDevToMain } from "@/utils/git";
import { clearAllUnpublishedItems } from "@/utils/config";
import { UnpublishedPage } from "@/types";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));

    if (action === "publish all") {
      // For all page which have been created with or without editing during this publishing phase,
      // set their "publish" status in front-matter to true
      siteConfig.unpublishedPages.forEach(async (page: UnpublishedPage) => {
        const filePath = await resolveMdxFilePath(page.name);
        const fileContent = readFile(filePath);
        if(/published:\s*false/.test(fileContent)) {
          fileContent.replace(/published:\s*false/, "published: true");
          updateFile(filePath, fileContent);
          await handleGitFileCommit(filePath, "update");
        }
      });


      // Update the site-config.json to clear all unpublished items
      const updatedSiteConfig = clearAllUnpublishedItems(siteConfig);
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));

      await handleGitFileCommit(siteConfigPath, "update");

      

      await mergeDevToMain();
      return NextResponse.json({ message: "Site published successfully" });
    }

    if (action === "read config") {
      return NextResponse.json(siteConfig);
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
