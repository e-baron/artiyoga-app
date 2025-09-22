// Create a new POST endpoint to publish all unpublished items

import { NextResponse } from "next/server";
import {
  getFilePath,
  readFile,
  resolveMdxFilePath,
  updateFile,
} from "@/utils/files";
import { handleGitFileCommit, mergeDevToMain } from "@/utils/git";
import { clearAllUnpublishedItems } from "@/utils/config";
import { UnpublishedPage } from "@/types";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));

    if (action === "publish all") {
      // For all pages that have been created or edited during this publishing phase,
      // set their "publish" status in front-matter to true
      for (const page of siteConfig.unpublishedPages) {
        const filePath = await resolveMdxFilePath(page.name);
        const fileContent = readFile(filePath);

        if (/published:\s*false/.test(fileContent)) {
          const updatedContent = fileContent.replace(
            /published:\s*false/,
            "published: true"
          );
          updateFile(filePath, updatedContent);
          await handleGitFileCommit(filePath, "update");
        }
      }

      // Update the site-config.json to clear all unpublished items
      const updatedSiteConfig = clearAllUnpublishedItems(siteConfig);
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));

      await handleGitFileCommit(siteConfigPath, "update");

      // Merge the "dev" branch into "main"
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
