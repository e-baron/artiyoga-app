import * as fs from "fs-extra";
import * as fsSync from "fs";
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

    // Copy .github directory if it exists
    const githubSrc = path.join(process.cwd(), ".github");
    const githubDest = path.join(appPath, ".github");
    if (await fs.pathExists(githubSrc)) {
      console.log("[packaging-git] Copying .github to", githubDest);
      await fs.copy(githubSrc, githubDest);
    } else {
      console.warn("[packaging-git] .github directory not found at", githubSrc);
    }

    // Copy package-lock.json if it exists
    const packageLockSrc = path.join(process.cwd(), "package-lock.json");
    const packageLockDest = path.join(appPath, "package-lock.json");
    if (await fs.pathExists(packageLockSrc)) {
      console.log(
        "[packaging-git] Copying package-lock.json to",
        packageLockDest
      );
      await fs.copy(packageLockSrc, packageLockDest);
    } else {
      console.warn(
        "[packaging-git] package-lock.json file not found at",
        packageLockSrc
      );
    }

    console.log("[packaging-git] Git files copy completed.");
  } catch (error) {
    console.error("[packaging-git] Error copying git files:", error);
    throw error;
  }

  // Find the package.json in the packaged app
  let packageJsonPath: string;

  if (packager.platform.name === "mac") {
    packageJsonPath = path.join(
      appOutDir,
      `${packager.appInfo.productFilename}.app`,
      "Contents",
      "Resources",
      "app",
      "package.json"
    );
  } else if (packager.platform.name === "windows") {
    packageJsonPath = path.join(appOutDir, "resources", "app", "package.json");
  } else {
    // Linux
    packageJsonPath = path.join(appOutDir, "resources", "app", "package.json");
  }

  // Use fs.pathExists instead of fs.existsSync
  if (await fs.pathExists(packageJsonPath)) {
    console.log("Updating package.json in packaged app...");

    // Read the current package.json using regular fs
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // Add the missing script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts["build:next:export"] =
      "NEXT_PUBLIC_NODE_ENV=production npm run generate-static-data && next build";

    // Write the updated package.json back
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log("Updated package.json with build:next:export script");
  } else {
    console.warn("Could not find package.json at:", packageJsonPath);
  }
}
