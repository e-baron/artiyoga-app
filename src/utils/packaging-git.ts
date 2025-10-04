// Updated packaging-git.ts
import fsExtra from "fs-extra";
import * as path from "path";

interface PackagingContext {
  appOutDir: string;
  packager: {
    platform: { name: string };
    appInfo: { productFilename: string };
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
  } else {
    appPath = path.join(appOutDir, "resources", "app");
  }

  const projectRepoDir = path.resolve(".");
  const gitSrc = path.join(projectRepoDir, ".git");
  const gitDest = path.join(appPath, ".git");
  const gitIgnoreSrc = path.join(projectRepoDir, ".gitignore");
  const gitIgnoreDest = path.join(appPath, ".gitignore");
  const githubSrc = path.join(projectRepoDir, ".github");
  const githubDest = path.join(appPath, ".github");
  // const packageLockSrc = path.join(projectRepoDir, "package-lock.json");
  // const packageLockDest = path.join(appPath, "package-lock.json");

  console.log(
    "[packaging-git] Starting to copy git files...",
    "gitSrc:",
    gitSrc,
    "gitDest:",
    gitDest
  );

  // Copy your existing git files
  try {
    await fsExtra.copy(gitSrc, gitDest);
    console.log("[packaging-git] Copying .git from", gitSrc, "to", gitDest);
  } catch (e) {
    console.error("[packaging-git] Error copying .git:", e);
  }

  try {
    if (await fsExtra.pathExists(gitIgnoreSrc)) {
      await fsExtra.copy(gitIgnoreSrc, gitIgnoreDest);
      console.log("[packaging-git] Copying .gitignore to", gitIgnoreDest);
    }
  } catch (e) {
    console.error("[packaging-git] Error copying .gitignore:", e);
  }

  try {
    if (await fsExtra.pathExists(githubSrc)) {
      await fsExtra.copy(githubSrc, githubDest);
      console.log("[packaging-git] Copying .github to", githubDest);
    }
  } catch (e) {
    console.error("[packaging-git] Error copying .github:", e);
  }

  /*
  try {
    if (await fsExtra.pathExists(packageLockSrc)) {
      await fsExtra.copy(packageLockSrc, packageLockDest);
      console.log(
        "[packaging-git] Copying package-lock.json to",
        packageLockDest
      );
    }
  } catch (e) {
    console.error("[packaging-git] Error copying package-lock.json:", e);
  }*/

  console.log("[packaging-git] Git files copy completed.");

  // Update package.json to add build:next:export script
  console.log("Updating package.json in packaged app...");
  try {
    const packageJsonPath = path.join(appPath, "package.json");
    const packageJsonContent = await fsExtra.readJson(packageJsonPath);

    // Check if build:next:export script already exists
    if (
      !packageJsonContent.scripts ||
      !packageJsonContent.scripts["build:next:export"]
    ) {
      packageJsonContent.scripts = packageJsonContent.scripts || {};
      packageJsonContent.scripts["build:next:export"] =
        "NEXT_PUBLIC_NODE_ENV=production NEXT_PUBLIC_GITHUB_PAGES_BUILD=true next build";
      await fsExtra.writeJson(packageJsonPath, packageJsonContent, {
        spaces: 2,
      });
      console.log("Updated package.json with build:next:export script.");
    }
  } catch (error) {
    console.error("Error updating package.json:", error);
  }

  // FIX FOR NEXT.JS BINARY
  /*
  console.log("[packaging-git] Setting up Next.js binary...");

  try {
    // Ensure node_modules/.bin directory exists
    const binDir = path.join(appPath, "node_modules", ".bin");
    await fsExtra.ensureDir(binDir);

    // Fix for macOS - specifically handle the 'next' binary
    if (platform === "mac") {
      // Path to the next binary in node_modules
      const nextBinDir = path.join(appPath, "node_modules/next/dist/bin");
      const nextBin = path.join(nextBinDir, "next");

      // Ensure next/dist/bin directory exists
      await fsExtra.ensureDir(nextBinDir);

      // Check if next binary exists
      if (await fsExtra.pathExists(nextBin)) {
        console.log(
          "[packaging-git] Making Next.js binary executable:",
          nextBin
        );
        // Make it executable
        await fsExtra.chmod(nextBin, 0o755);
      } else {
        console.log("[packaging-git] Creating Next.js binary script");

        // Create a basic script that runs next.js
        const scriptContent = `#!/bin/bash
NODE_PATH=$(dirname $(dirname $(dirname "$0")))
node "$NODE_PATH/next/dist/cli/next-cli.js" "$@"
`;
        await fsExtra.writeFile(nextBin, scriptContent);
        await fsExtra.chmod(nextBin, 0o755);
      }

      // Create symlink in .bin directory
      const nextBinSymlink = path.join(binDir, "next");

      // Remove existing symlink if it exists
      if (await fsExtra.pathExists(nextBinSymlink)) {
        await fsExtra.remove(nextBinSymlink);
      }

      // Create the symlink
      try {
        await fsExtra.symlink(nextBin, nextBinSymlink, "file");
        console.log(
          "[packaging-git] Created symlink from",
          nextBin,
          "to",
          nextBinSymlink
        );
      } catch (err) {
        console.log(
          "[packaging-git] Failed to create symlink, copying file instead"
        );
        await fsExtra.copy(nextBin, nextBinSymlink);
        await fsExtra.chmod(nextBinSymlink, 0o755);
      }
    }

    console.log("[packaging-git] Next.js binary setup completed");
  } catch (error) {
    console.error("[packaging-git] Error setting up Next.js binary:", error);
  }*/
}
