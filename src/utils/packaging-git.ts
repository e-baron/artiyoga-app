import * as fs from "fs-extra";
import * as path from "path";

interface PackagingContext {
  appOutDir: string;
  packager: {
    platform: {
      name: string;
    };
    appInfo: {
      productFilename: string;
    };
  };
}

export default async function copyGitToPackage(
  context: PackagingContext
): Promise<void> {
  const { appOutDir, packager } = context;
  const platform = packager.platform.name;

  let appPath: string;
  if (platform === "mac") {
    appPath = path.join(
      appOutDir,
      `${packager.appInfo.productFilename}.app`,
      "Contents",
      "Resources",
      "app"
    );
  } else if (platform === "win") {
    appPath = path.join(appOutDir, "resources", "app");
  } else {
    appPath = path.join(appOutDir, "resources", "app");
  }

  const gitSrc = path.join(process.cwd(), ".git");
  const gitDest = path.join(appPath, ".git");
  const gitignoreSrc = path.join(process.cwd(), ".gitignore");
  const gitignoreDest = path.join(appPath, ".gitignore");

  try {
    if (await fs.pathExists(gitSrc)) {
      console.log("[packaging-git] Copying .git to", gitDest);
      await fs.copy(gitSrc, gitDest);
    } else {
      console.warn("[packaging-git] .git directory not found at", gitSrc);
    }

    if (await fs.pathExists(gitignoreSrc)) {
      console.log("[packaging-git] Copying .gitignore to", gitignoreDest);
      await fs.copy(gitignoreSrc, gitignoreDest);
    } else {
      console.warn(
        "[packaging-git] .gitignore file not found at",
        gitignoreSrc
      );
    }
  } catch (error) {
    console.error("[packaging-git] Error copying git files:", error);
    throw error;
  }
}
