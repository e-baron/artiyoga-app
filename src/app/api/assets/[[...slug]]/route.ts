import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime-types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> } // CORRECTED TYPE: slug is optional
) {
  const paramsResolved = await params;
  // This check correctly handles the case where slug is undefined or empty
  if (!paramsResolved.slug || paramsResolved.slug.length === 0) {
    return new NextResponse("File path is required.", { status: 400 });
  }

  const filePathFromParams = paramsResolved.slug.join("/");

  try {
    // Prevent directory traversal attacks
    const safeSuffix = path
      .normalize(filePathFromParams)
      .replace(/^(\.\.(\/|\\|$))+/, "");

    const absolutePath = path.join(process.cwd(), "public", safeSuffix);

    // Check if the file exists
    await fs.access(absolutePath);

    // Read the file and determine its content type
    const fileBuffer = await fs.readFile(absolutePath);
    const contentType = mime.lookup(absolutePath) || "application/octet-stream";

    // Return the file content as a response. NextResponse handles Buffers.
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(`Failed to serve asset: ${filePathFromParams}`, error);
    return new NextResponse("File not found.", { status: 404 });
  }
}
