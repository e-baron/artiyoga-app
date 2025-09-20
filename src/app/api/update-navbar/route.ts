import { NextResponse } from "next/server";
import { getFilePath, updateFile, readFile } from "@/utils/files";
import { handleGitFileCommit } from "@/utils/git";

export async function POST(request: Request) {
  try {
    const siteConfigPath = getFilePath("src/config/site-config.json");
    const body = await request.json();
    const {
      action,
      parentIndex,
      index,
      name,
      link,
      protected: protectedItem,
    } = body;

    const siteConfig = JSON.parse(readFile(siteConfigPath));
    const menuLinks = siteConfig.menuLinks;

    if (action === "read") {
      // Handle the "read" action
      console.log("Fetching menu links...");
      console.log("Fetched menu links:", menuLinks);
      return NextResponse.json({ menuLinks });
    } else if (action === "add") {
      menuLinks.splice(parentIndex + 1, 0, {
        name,
        link,
        protected: protectedItem,
      });
    } else if (action === "add-child") {
      menuLinks[parentIndex].subMenu = menuLinks[parentIndex].subMenu || [];
      menuLinks[parentIndex].subMenu.push({
        name,
        link,
        protected: protectedItem,
      });
    } else if (action === "delete") {
      if (index !== undefined) {
        menuLinks[parentIndex].subMenu.splice(index, 1);
      } else {
        menuLinks.splice(parentIndex, 1);
      }
    } else if (action === "edit") {
      if (index !== undefined) {
        menuLinks[parentIndex].subMenu[index] = {
          name,
          link,
          protected: protectedItem,
        };
      } else {
        // Only edit name, link, and protected status, keeping subMenu intact if it exists, else no subMenu props
        const existingSubMenu = menuLinks[parentIndex].subMenu || [];
        menuLinks[parentIndex] = {
          name,
          link,
          protected: protectedItem,
          ...(existingSubMenu.length > 0 && { subMenu: existingSubMenu }),
        };
        
      }
    } else {
      return NextResponse.json(
        { message: `Invalid action: ${action}` },
        { status: 400 }
      );
    }

    // Update the site config file
    updateFile(siteConfigPath, JSON.stringify(siteConfig, null, 2));
    handleGitFileCommit(siteConfigPath, "site-config.json", "update");

    return NextResponse.json({
      message: `Action "${action}" completed successfully.`,
      updatedMenuLinks: menuLinks,
    });
  } catch (error) {
    console.error("Error processing action:", error);
    return NextResponse.json(
      {
        message:
          "An error occurred while processing the action." +
          (error instanceof Error ? " " + error.message : ""),
      },
      { status: 500 }
    );
  }
}
