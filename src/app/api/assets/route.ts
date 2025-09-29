// Add POST endpoint to handle asset uploads and to allow to list and delete assets
import { NextResponse } from "next/server";
import {
  getFilePath,
  readFile,
  fileExists,
  listFilesInDirectory,
  createFile,
  deleteFile,
} from "@/utils/files";
import { Box } from "@mui/material";
import React from "react";
import {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
} from "@/utils/git";

export async function POST(request: Request) {
  try {
    // Handle other actions (create, read, delete)
    const { action, filepath } = await request.json();

    if (action === "create") {
      if (await fileExists(getFilePath(filepath))) {
        return NextResponse.json(
          { error: "File already exists" },
          { status: 400 }
        );
      }

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

        const buffer = Buffer.from(await file.arrayBuffer());
        createFile(filepath, buffer.toString("utf-8"));
        await handleGitFileCommit(filepath, "add (asset)");
        return NextResponse.json({ message: "File uploaded successfully." });
      }
    }

    if (action === "read") {
      const fileNames = await listFilesInDirectory("public");
      return NextResponse.json({ fileNames });
    }

    if (action === "delete") {
      if (!deleteFile(filepath)) {
        return NextResponse.json(
          { error: "File does not exist" },
          { status: 400 }
        );
      }
      await handleGitFileCommit(filepath, "delete (asset)");
      return NextResponse.json({ message: "File deleted successfully" });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Error in Asset API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
