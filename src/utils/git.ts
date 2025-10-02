import fs from "fs";
import ghpages from "gh-pages";
import { spawnSync } from "child_process";
import * as git from "isomorphic-git";
import path from "path";
import fse from "fs-extra";
import {
  copyAdditionalProjectFiles,
  deleteDirectory,
  deleteFile,
  updateFileName,
} from "@/utils/files";
import { copyDir } from "@/utils/files";
import { update } from "lodash";
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
 * Publishes the project to GitHub Pages.
 * We need a temporary directory to export the current state of the repository,
 * build the project there, and then publish the built files to GitHub Pages.
 * The reason is that we don't want to mess with the current working next server instance.
 *
 * @param tempExportDir Temporary directory to export the repository (default: "export").
 * @param branch The branch to publish (default: "dev").
 */
const publishToGitHubPages = async (
  branch = "dev",
  tempExportDir = "export"
) => {
  try {
    const tempExportDirPath = path.resolve(tempExportDir);
    const projectDir = path.resolve(".");

    deleteDirectory(tempExportDirPath);
    console.log(`Deleted old ${tempExportDirPath} directory.`);

    // Copy project files to the new directory
    await checkoutIndexLike(projectDir, tempExportDirPath);

    console.log(`Exported repository to ${tempExportDirPath}.`);

    try {
      console.log("Starting build process...");
      const cleanEnv: NodeJS.ProcessEnv = {
        ...process.env, // Inherit the current environment
        PWD: tempExportDirPath, // Set PWD to the dist directory
        INIT_CWD: tempExportDirPath, // Set INIT_CWD to the dist directory
        npm_config_local_prefix: tempExportDirPath, // Set npm's local prefix to the dist directory
        npm_package_json: path.join(tempExportDirPath, "package.json"), // Point to the correct package.json
        NODE_ENV: "production", // Explicitly set NODE_ENV to production
        TURBOPACK: undefined, // Remove Turbopack flag for production builds
        npm_lifecycle_event: undefined, // Remove lifecycle event
        npm_lifecycle_script: undefined, // Remove lifecycle script
        NEXT_PUBLIC_NODE_ENV: "production", // Ensure this is set for Next.js
        _: undefined, // Remove reference to the parent `next` binary
      };

      const sourceNodeModules = path.join(projectDir, "node_modules");
      const destNodeModules = path.join(tempExportDirPath, "node_modules");

      // A. Forcefully remove any 'node_modules' file OR directory created by git checkout.
      // This guarantees a clean slate.
      console.log(`Ensuring destination for node_modules is clean...`);
      fse.removeSync(destNodeModules);

      // B. Now, copy the real node_modules directory.
      console.log("Copying node_modules to temporary directory...");
      fse.copySync(sourceNodeModules, destNodeModules, { dereference: false });
      console.log("node_modules copied successfully.");

      const outDir = path.join(tempExportDirPath, "out");
      copyAdditionalProjectFiles(outDir, [".nojekyll", "CNAME"]);

      // Remove the useless next.config.js in the temp directory
      const nextConfigPath = path.join(tempExportDirPath, "next.config.js");
      deleteFile(nextConfigPath);
      console.log("Removed next.config.js from temporary directory.");
      // Rename the next.config.export.js to next.config.js
      updateFileName(
        path.join(tempExportDirPath, "next.config.export.js"),
        nextConfigPath
      );
      console.log("Renamed next.config.export.js to next.config.js.");

      // Define the path to the `next` executable within the temp directory
      const nextExecutablePath = path.join(
        tempExportDirPath,
        "node_modules",
        ".bin",
        "next"
      );

      // Run the build command directly using the `next` executable
      console.log("Running next build...");
      const buildResult = spawnSync(nextExecutablePath, ["build"], {
        cwd: tempExportDirPath,
        stdio: "inherit",
        env: cleanEnv,
      });

      if (buildResult.status !== 0) {
        throw new Error(`next build failed with code ${buildResult.status}`);
      }
      console.log("Project built successfully.");
    } catch (error) {
      throw new Error(
        `Build process failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Step 3: Publish to GitHub Pages
    console.log("Publishing to GitHub Pages...");
    await new Promise<void>((resolve, reject) => {
      ghpages.publish(
        path.join(tempExportDirPath, "out"),
        {
          branch: "gh-pages",
          message: "Auto-publish to GitHub Pages",
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

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
