import { NextResponse } from "next/server";
import {
  getFilePath,
  readFile,
  updateFile,
  resolveMdxFilePath,
} from "@/utils/files";
import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { addUnpublishedPage } from "@/utils/config";
import { isDev } from "@/utils/env";

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
      await handleGitFileCommit(filePath, "update");

      // Update the site-config.json to add the new page to unpublishedPages
      const updatedSiteConfig = addUnpublishedPage(siteConfig, {
        name: slug,
        operation: "edit",
      });
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));

      await handleGitFileCommit(siteConfigPath, "update");
      if (!isDev()) {
        // in prod, we want to rebuild the page immediately
        await regenerateContentlayer();
        await revalidatePage(slug);
      }
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

async function regenerateContentlayer() {
  try {
    // Approach 1: Trigger contentlayer regeneration by touching contentlayer.config file
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.join(process.cwd(), "contentlayer.config.ts");

    if (fs.existsSync(configPath)) {
      const now = new Date();
      fs.utimesSync(configPath, now, now);
      console.log("[API] Contentlayer config touched for regeneration");
    }

    // Approach 2: Clear Next.js cache completely
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout"); // This clears all cached data

    console.log("[API] Contentlayer regeneration triggered");
  } catch (error) {
    console.error("[API] Contentlayer regeneration failed:", error);
    throw error;
  }
}

async function revalidatePage(slug: string) {
  try {
    const { revalidatePath } = await import("next/cache");

    // Revalidate the specific page
    revalidatePath(`/${slug}`);

    // Also revalidate the root page if it's the index
    if (slug === "index") {
      revalidatePath("/");
    }

    console.log(`[API] Page /${slug} revalidated`);
  } catch (error) {
    console.error("[API] Page revalidation failed:", error);
    throw error;
  }
}
