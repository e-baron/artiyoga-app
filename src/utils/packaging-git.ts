import fsExtra from "fs-extra";
import { readFile, writeFile } from "fs/promises";
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

  /*the working directory has to get all the files tracked by git */ 
  

const projectRepoDir = path.resolve(".");

  const gitSrc = path.join(projectRepoDir, ".git");
  const gitDest = path.join(appPath, ".git");
  const gitignoreSrc = path.join(projectRepoDir, ".gitignore");
  const gitignoreDest = path.join(appPath, ".gitignore");
  const githubSrc = path.join(projectRepoDir, ".github");
  const githubDest = path.join(appPath, ".github");
  // const packageLockSrc = path.join(process.cwd(), "package-lock.json");
  // const packageLockDest = path.join(appPath, "package-lock.json");
  

  console.log("[packaging-git] Starting to copy git files... gitSrc:", gitSrc, "gitDest:", gitDest);

  try {
    if (await fsExtra.pathExists(gitSrc)) {
      console.log("[packaging-git] Copying .git from", gitSrc, "to", gitDest);
      await fsExtra.copy(gitSrc, gitDest);
    }
    if (await fsExtra.pathExists(gitignoreSrc)) {
      console.log("[packaging-git] Copying .gitignore to", gitignoreDest);
      await fsExtra.copy(gitignoreSrc, gitignoreDest);
    }
    if (await fsExtra.pathExists(githubSrc)) {
      console.log("[packaging-git] Copying .github to", githubDest);
      await fsExtra.copy(githubSrc, githubDest);
    }
    /*
    if (await fsExtra.pathExists(packageLockSrc)) {
      console.log(
        "[packaging-git] Copying package-lock.json to",
        packageLockDest
      );
      await fsExtra.copy(packageLockSrc, packageLockDest);
    }*/
    console.log("[packaging-git] Git files copy completed.");
  } catch (e) {
    console.error("[packaging-git] Error copying git files:", e);
    throw e;
  }

  
  // Determine packaged app package.json path
  let packageJsonPath: string;
  if (platform === "mac") {
    packageJsonPath = path.join(
      appOutDir,
      `${packager.appInfo.productFilename}.app`,
      "Contents",
      "Resources",
      "app",
      "package.json"
    );
  } else {
    packageJsonPath = path.join(appOutDir, "resources", "app", "package.json");
  }

  if (!(await fsExtra.pathExists(packageJsonPath))) {
    console.warn("package.json not found in packaged app:", packageJsonPath);
    return;
  }

  console.log("Updating package.json in packaged app...");

  // Read + modify + write manually (avoid fs-extra JSON helpers)
  const raw = await readFile(packageJsonPath, "utf8");
  interface PackageJson {
    scripts?: Record<string, string>;
    [key: string]: unknown; // Allow additional properties
  }

  let pkg: PackageJson;
  try {
    pkg = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse packaged package.json:", e);
    return;
  }

  pkg.scripts = { ...(pkg.scripts || {}) };
  pkg.scripts["build:next:export"] =
    "NEXT_PUBLIC_NODE_ENV=production next build";

  await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2), "utf8");
  console.log("Updated package.json with build:next:export script.");
}
