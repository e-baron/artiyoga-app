import { NextResponse } from "next/server";
import {
  getFilePath,
  fileExists,
  listFilesInDirectory,
  createFile,
  deleteFile,
  readFile,
  updateFile,
  createFileFromBlob,
} from "@/utils/files";

import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";
import { addUnpublishedAsset } from "@/utils/config";
import { act } from "react";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // get the action from the form data

      const formData = await request.formData();
      const file = formData.get("file") as Blob | null;
      const filepath = formData.get("filepath") as string;
      const action = formData.get("action") as string | null;

      if (!file || !filepath || action !== "create") {
        return NextResponse.json(
          { error: "File or filepath is missing." },
          { status: 400 }
        );
      }

      await handleUncommittedChangesAndSwitchToDev();

      // Add "public/" prefix to the filepath if not already present
      const fullFilePath = filepath.startsWith("public/")
        ? filepath
        : `public/${filepath}`;

      if (await fileExists(fullFilePath)) {
        return NextResponse.json(
          { error: "File already exists." },
          { status: 400 }
        );
      }

      await createFileFromBlob(fullFilePath, file);
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

  // Check if the action is to delete a file
  try {
    const { action, filepath } = await request.json();
    if (action === "delete" && filepath) {
      if (!fileExists(filepath)) {
        return NextResponse.json(
          { error: "File does not exist." },
          { status: 400 }
        );
      }

      await handleUncommittedChangesAndSwitchToDev();

      deleteFile(filepath);
      await handleGitFileCommit(filepath, "delete (asset)");

      // Update the site-config.json to add the asset to unpublishedAssets
      const siteConfigPath = getFilePath("src/config/site-config.json");
      const siteConfig = JSON.parse(readFile(siteConfigPath));
      const updatedSiteConfig = addUnpublishedAsset(siteConfig, {
        filepath,
        operation: "delete",
      });
      updateFile(siteConfigPath, JSON.stringify(updatedSiteConfig, null, 2));
      await handleGitFileCommit(siteConfigPath, "update");

      return NextResponse.json({ message: "File deleted successfully." });
    }

    if (action === "read") {
      const fileNames = await listFilesInDirectory("public");
      return NextResponse.json({ fileNames });
    }

    if (!action || !filepath) {
      return NextResponse.json(
        { error: "Invalid action or missing filepath." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in Asset API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  // If no valid action is provided
  return NextResponse.json(
    { error: "Invalid request. Use 'create' or 'delete' action." },
    { status: 400 }
  );
}
