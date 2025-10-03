import fs from "fs";
import ghpages from "gh-pages";
import { spawnSync } from "child_process";
import * as git from "isomorphic-git";
import path from "path";
import fse from "fs-extra";
import { copyAdditionalProjectFiles, deleteDirectory } from "@/utils/files";

/**
 * Handles Git commit operations for a specific file. First, if there are uncommitted changes on the current branch, it commits them.
 * Then, it switches to the "dev" branch (creating it if it doesn't exist), adds the specified file, and commits it with a message.
 * @param filePath The path to the file to commit. It can be absolute or relative to the repository root.
 * @param fileOperationType The type of file operation (e.g., "add", "update").
 * @param author The author to use for the commit (e.g., "web-app <web-app@example.com>").
 * @returns void
 */
const handleGitFileCommit = async (
  filePath: string,
  fileOperationType = "add",
  author = "web-app <web-app@example.com>"
) => {
  try {
    const repoDir = path.resolve(".");
    const absoluteFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(repoDir, filePath); // Ensure the file path is absolute
    const filename = absoluteFilePath.split("/").pop();
    if (!filename) {
      throw new Error("Invalid file path provided.");
    }

    // Add the file to the index if not already added
    await git.add({
      fs,
      dir: repoDir,
      filepath: path.relative(repoDir, absoluteFilePath),
    });

    console.log(`Staged file: ${filename}`);

    // Check if there are changes to commit
    const status = await git.status({
      fs,
      dir: repoDir,
      filepath: path.relative(repoDir, absoluteFilePath),
    });
    if (status === "unmodified") {
      console.log("No changes to commit.");
      return;
    }

    // Commit the file with a message and custom author
    console.log(`Committing new file: ${filename}`);
    await git.commit({
      fs,
      dir: repoDir,
      message: `docs: ${fileOperationType} ${filename} (auto-generated)`,
      author: {
        name: author.split(" <")[0],
        email: author.split("<")[1]?.replace(">", ""),
      },
    });
  } catch (error) {
    console.error("Error handling Git operations:", error);
    throw new Error(
      `Git operation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Handles the staging and committing of a file deletion.
 * @param filePath The path to the file that has been deleted.
 * @param author The author to use for the commit.
 */
const handleGitFileDelete = async (
  filePath: string,
  author = "web-app <web-app@example.com>"
) => {
  try {
    const repoDir = path.resolve(".");
    const relativeFilePath = path.relative(repoDir, filePath);
    const filename = path.basename(relativeFilePath);

    // Use git.remove to stage the deletion.
    // This tells Git that the file should be removed from the index.
    await git.remove({ fs, dir: repoDir, filepath: relativeFilePath });
    console.log(`Staged deletion of file: ${filename}`);

    // Commit the staged deletion
    await git.commit({
      fs,
      dir: repoDir,
      message: `docs: delete ${filename} (auto-generated)`,
      author: {
        name: author.split(" <")[0],
        email: author.split("<")[1]?.replace(">", ""),
      },
    });

    console.log(`Committed deletion of file: ${filename}`);
  } catch (error) {
    console.error("Error handling Git delete operation:", error);
    throw new Error(
      `Git delete failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Handles uncommitted changes and switches to the "dev" branch. If the "dev" branch doesn't exist, it creates it.
 * @param author The author to use for the commit (e.g., "web-app <web-app@example.com>").
 */
/**
 * Handles uncommitted changes and switches to the "dev" branch. If the "dev" branch doesn't exist, it creates it.
 * @param author The author to use for the commit (e.g., "web-app <web-app@example.com>").
 */
const handleUncommittedChangesAndSwitchToDev = async (
  author = "web-app <web-app@example.com>"
) => {
  try {
    const repoDir = path.resolve(".");

    // Check the current branch
    console.log("Checking current branch...");
    const currentBranch = await git.currentBranch({ fs, dir: repoDir });
    if (currentBranch !== "dev") {
      // Check for uncommitted changes
      console.log("Checking for uncommitted changes...");
      const FILE = 0,
        WORKDIR = 2,
        STAGE = 3;

      const statusMatrix = await git.statusMatrix({ fs, dir: repoDir });
      const uncommittedFiles = statusMatrix
        .filter((row) => row[WORKDIR] !== row[STAGE]) // Detect files with differences between WORKDIR and STAGE
        .map((row) => row[FILE]); // Extract file paths

      if (uncommittedFiles.length > 0) {
        console.log("Uncommitted changes detected. Staging and committing...");
        // Stage and commit all uncommitted files
        for (const filepath of uncommittedFiles) {
          console.log(`Staging file: ${filepath}`);
          await git.add({ fs, dir: repoDir, filepath });
        }
        console.log("Committing changes...");
        await git.commit({
          fs,
          dir: repoDir,
          message: "chore: auto-commit changes before switching to dev branch",
          author: {
            name: author.split(" <")[0],
            email: author.split("<")[1]?.replace(">", ""),
          },
        });
        console.log("Changes committed.");
      } else {
        console.log("No uncommitted changes detected.");
      }

      // Check if the "dev" branch exists
      console.log("Checking if 'dev' branch exists...");
      const branches = await git.listBranches({ fs, dir: repoDir });
      if (!branches.includes("dev")) {
        console.log("'dev' branch does not exist. Creating it...");
        await git.branch({ fs, dir: repoDir, ref: "dev" });
        console.log("'dev' branch created.");
      }

      // Switch to the "dev" branch
      console.log("Switching to 'dev' branch...");
      await git.checkout({
        fs,
        dir: repoDir,
        ref: "dev",
        nonBlocking: true,
        noCheckout: true,
      });
      console.log("Switched to 'dev' branch.");
    }
  } catch (error) {
    console.error("Error handling uncommitted changes:", error);
    throw new Error(
      `Uncommitted changes handling failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Merges changes from the source branch into the target branch.
 * This performs a simple merge using isomorphic-git's `merge` function.
 *
 * @param sourceBranch The branch to merge from.
 * @param targetBranch The branch to merge into.
 * @param author The author to use for the merge commit (e.g., "web-app <web-app@example.com>").
 */
const mergeBranches = async (
  sourceBranch: string,
  targetBranch: string,
  author = "web-app <web-app@example.com>"
) => {
  try {
    const repoDir = path.resolve(".");

    // Ensure we are on the target branch
    await git.checkout({ fs, dir: repoDir, ref: targetBranch });

    // Perform the merge
    const mergeResult = await git.merge({
      fs,
      dir: repoDir,
      ours: targetBranch,
      theirs: sourceBranch,
      author: {
        name: author.split(" <")[0],
        email: author.split("<")[1]?.replace(">", ""),
      },
    });

    if (mergeResult.fastForward) {
      console.log(
        `Fast-forward merge completed: ${sourceBranch} -> ${targetBranch}`
      );
    } else if (mergeResult.mergeCommit) {
      console.log(`Merge commit created: ${mergeResult.mergeCommit}`);
    } else {
      console.log(`Merge completed without a commit.`);
    }
  } catch (error) {
    console.error("Error merging branches:", error);
    throw new Error(
      `Merge failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Publishes the project to GitHub Pages using a simplified approach.
 */
const publishToGitHubPages = async (branch = "dev", outDir = "out") => {
  try {
    const outDirPath = path.resolve(outDir);
    const projectDir = path.resolve(".");
    console.log("Building project for export...");

    /*const nextConfigPath = path.join(projectDir, "next.config.ts");
    const nextConfigBackupPath = path.join(projectDir, "next.config.js.backup");
    const nextConfigExportPath = path.join(projectDir, "next.config.export.ts");*/

    /*
    if (fs.existsSync(nextConfigPath)) {
      fs.copyFileSync(nextConfigPath, nextConfigBackupPath);
    }
    if (fs.existsSync(nextConfigExportPath)) {
      fs.copyFileSync(nextConfigExportPath, nextConfigPath);
      console.log("Switched to export configuration.");
    }*/

    try {
      const cleanEnv: NodeJS.ProcessEnv = {
        ...process.env,
        NODE_ENV: "production",
        NEXT_PUBLIC_NODE_ENV: "production",
        NEXT_PUBLIC_GITHUB_PAGES_BUILD: "true",
        PWD: projectDir, // Set PWD to the dist directory
        INIT_CWD: projectDir, // Set INIT_CWD to the dist directory
        npm_config_local_prefix: outDirPath, // Set npm's local prefix to the dist directory
        npm_package_json: path.join(outDirPath, "package.json"), // Point to the correct package.json
        TURBOPACK: undefined, // Remove Turbopack flag for production builds
        npm_lifecycle_event: undefined, // Remove lifecycle event
        npm_lifecycle_script: undefined, // Remove lifecycle script
        _: undefined, // Remove referenc
      };

      // Add this before committing:
      console.log("Generating static data...");
      const genScript = path.join(
        projectDir,
        "src",
        "utils",
        "generate-static-data.runtime.mjs"
      );
      if (fs.existsSync(genScript)) {
        const genResult = spawnSync(
          "node",
          ["--experimental-modules", genScript],
          {
            cwd: projectDir,
            stdio: "pipe",
            env: cleanEnv,
          }
        );
        if (genResult.stdout) console.log(genResult.stdout.toString());
        if (genResult.stderr) console.error(genResult.stderr.toString());
        if (genResult.status !== 0)
          throw new Error("Static data generation failed");

        // Stage the generated files
        console.log("Staging generated files...");

        try {
          await handleGitFileCommit("src/data/static-data.ts", "update");
        } catch (e) {
          console.log("static-data.ts: no changes to stage");
        }
        try {
          await handleGitFileCommit("public/static-contents.json", "update");
        } catch (e) {
          console.log("static-contents.json: no changes to stage");
        }
        console.log("Generated static files processed.");
      } else {
        console.warn("Generator script not found:", genScript);
      }

      // Build
      let buildResult;
      // When running from packaged app, cwd is inside the bundle
      console.log("Current working directory:", projectDir);

      // Try multiple possible locations for next executable
      const possibleNextPaths = [
        path.join(projectDir, "node_modules", ".bin", "next"),
        path.join(
          projectDir,
          "..",
          "..",
          "..",
          "..",
          "..",
          "node_modules",
          ".bin",
          "next"
        ), // Go up from app bundle
        path.join(process.cwd(), "node_modules", ".bin", "next"),
        "next", // Global fallback
      ];

      let nextExecutablePath = null;
      for (const nextPath of possibleNextPaths) {
        console.log("Checking next at:", nextPath);
        // Check for both regular files and symlinks
        try {
          const stats = fs.lstatSync(nextPath);
          if (stats.isFile() || stats.isSymbolicLink()) {
            nextExecutablePath = nextPath;
            console.log(
              "Found next at:",
              nextPath,
              stats.isSymbolicLink() ? "(symlink)" : "(file)"
            );
            break;
          }
        } catch (error) {
          // File/symlink doesn't exist, continue to next path
          console.log("Not found at:", nextPath);
        }
      }
      if (nextExecutablePath) {
        console.log("Using next executable at:", nextExecutablePath);
        buildResult = spawnSync(nextExecutablePath, ["build"], {
          cwd: projectDir,
          stdio: "pipe",
          env: cleanEnv,
        });
      } else {
        console.log("Local next not found, running npm run build...");
        buildResult = spawnSync("npm", ["run", "build:next:export"], {
          cwd: projectDir,
          stdio: "pipe",
          env: cleanEnv,
        });
      }

      if (buildResult.stdout)
        console.log("Build stdout:", buildResult.stdout.toString());
      if (buildResult.stderr)
        console.log("Build stderr:", buildResult.stderr.toString());

      if (buildResult.status !== 0) {
        throw new Error(`Build failed (status ${buildResult.status})`);
      }

      console.log("Project built successfully.");
      copyAdditionalProjectFiles(outDirPath, [".nojekyll", "CNAME"]);
    } finally {
      /*if (fs.existsSync(nextConfigBackupPath)) {
        fs.copyFileSync(nextConfigBackupPath, nextConfigPath);
        fs.unlinkSync(nextConfigBackupPath);
        console.log("Restored original next.config.ts.");
      }*/
    }

    console.log("Publishing to GitHub Pages...");
    await new Promise<void>((resolve, reject) =>
      ghpages.publish(
        outDirPath,
        { branch: "gh-pages", message: "Auto-publish to GitHub Pages" },
        (err) => (err ? reject(err) : resolve())
      )
    );
    console.log("Successfully published to GitHub Pages!");
  } catch (error) {
    console.error("Error publishing to GitHub Pages:", error);
    throw new Error(
      `Publishing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Mimics: git checkout-index -a --prefix=<targetDir>
 * This version explicitly IGNORES any paths inside node_modules to prevent
 * conflicts with the subsequent node_modules copy operation.
 *
 * @param repoDir  Path to the .git repository root
 * @param targetDir Destination folder to export the files into
 */
async function checkoutIndexLike(repoDir: string, targetDir: string) {
  const commitOid = await git.resolveRef({ fs, dir: repoDir, ref: "HEAD" });
  const { commit } = await git.readCommit({ fs, dir: repoDir, oid: commitOid });
  const { tree } = await git.readTree({ fs, dir: repoDir, oid: commit.tree });

  async function walkTree(treeEntries: git.TreeEntry[], basePath = "") {
    for (const entry of treeEntries) {
      const entryPath = path.join(basePath, entry.path);

      // *** THE CRITICAL FIX ***
      // Skip any paths that start with 'node_modules' to prevent conflicts
      // with the subsequent fse.copySync operation
      if (entryPath.startsWith("node_modules")) {
        console.log(`Skipping Git-tracked path: ${entryPath}`);
        continue;
      }

      if (entry.type === "tree") {
        const { tree: childTree } = await git.readTree({
          fs,
          dir: repoDir,
          oid: entry.oid,
        });
        await walkTree(childTree, entryPath);
      } else if (entry.type === "blob") {
        const { blob } = await git.readBlob({
          fs,
          dir: repoDir,
          oid: entry.oid,
        });
        const outPath = path.join(targetDir, entryPath);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, blob);
      }
    }
  }

  await walkTree(tree);
}

export {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
  mergeBranches,
  publishToGitHubPages,
  checkoutIndexLike,
  handleGitFileDelete,
};
