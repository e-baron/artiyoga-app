import { NextResponse } from "next/server";
import { getFilePath, readFile } from "@/utils/files";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const siteConfig = JSON.parse(readFile(siteConfigPath));

    if (action === "read") {
      return NextResponse.json(siteConfig);
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
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
