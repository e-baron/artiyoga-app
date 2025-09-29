import { NextResponse } from "next/server";
import {
  getFilePath,
  fileExists,
  listFilesInDirectory,
  createFile,
  deleteFile,
  readFile,
  updateFile,
} from "@/utils/files";

import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { addUnpublishedAsset } from "@/utils/config";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as Blob | null;
      const filepath = formData.get("filepath") as string;

      if (!file || !filepath) {
        return NextResponse.json(
          { error: "File or filepath is missing." },
          { status: 400 }
        );
      }

      await handleUncommittedChangesAndSwitchToDev();

      const buffer = Buffer.from(await file.arrayBuffer());
      createFile(filepath, buffer.toString("utf-8"));
      await handleGitFileCommit(filepath, "add (asset)");

      // Update the site-config.json to add the asset to unpublishedAssets
      const siteConfigPath = getFilePath("src/config/site-config.json");
      const siteConfig = JSON.parse(readFile(siteConfigPath));
      const updatedSiteConfig = addUnpublishedAsset(siteConfig, {
        filepath,
        operation: "add",
      });
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));
      await handleGitFileCommit(siteConfigPath, "update");

      return NextResponse.json({ message: "File uploaded successfully." });
    }
  } catch (error) {
    console.error("Error in Asset API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
