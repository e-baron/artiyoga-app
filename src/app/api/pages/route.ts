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
import { getAllRuntimePages } from "@/utils/runtime-pages";

export async function POST(request: Request) {
  try {
    const { action, slug, code } = await request.json();
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));

    const filePath = await resolveMdxFilePath(slug);

    if (action === "read") {
      const fileContent = readFile(filePath);
      return NextResponse.json({ code: fileContent });
    }

    if (action === "update") {
      await handleUncommittedChangesAndSwitchToDev();
      updateFile(filePath, code);
      await handleGitFileCommit(filePath, "update");

      const updatedSiteConfig = addUnpublishedPage(siteConfig, {
        name: slug,
        operation: "edit",
      });
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));
      await handleGitFileCommit(siteConfigPath, "update");

      return NextResponse.json({ message: "File updated successfully" });
    }

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

export async function generateStaticParams() {
  const allPages = await getAllRuntimePages();
  return allPages; 
}

export async function GET() {
  try {
    if (!isDev()) {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode." },
        { status: 403 }
      );
    }

    const allPages = await getAllRuntimePages();
    return NextResponse.json(allPages || []);
  } catch (error) {
    console.error("Error fetching pages:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred while fetching pages. " + errorMessage },
      { status: 500 }
    );
  }
}
