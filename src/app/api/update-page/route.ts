import { NextResponse } from "next/server";
import {
  getFilePath,
  readFile,
  updateFile,
  resolveMdxFilePath,
  getAbsoluteProjectFilePath,
} from "@/utils/files";
import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { addUnpublishedPage } from "@/utils/config";
import { isDev } from "@/utils/env";
import fs from "node:fs";
import path from "node:path";

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

      if (!isDev()) {
        // Runtime mode: just bump a version file if a watcher/poller is used
        fs.writeFileSync(
          getAbsoluteProjectFilePath(".content-version.json"),
          JSON.stringify({ version: Date.now() }, null, 2),
          "utf8"
        );
      }

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
