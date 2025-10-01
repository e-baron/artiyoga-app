import fs from "fs";
import ghpages from "gh-pages";
import { spawnSync } from "child_process";
import * as git from "isomorphic-git";
import path from "path";
import { deleteDirectory } from "./files";

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

    // Add the file to the index
    await git.add({
      fs,
      dir: repoDir,
      filepath: path.relative(repoDir, absoluteFilePath),
    });

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
      const statusMatrix = await git.statusMatrix({ fs, dir: repoDir });
      const hasUncommittedChanges = statusMatrix.some(
        ([, , worktreeStatus]) => worktreeStatus !== 0
      );

      if (hasUncommittedChanges) {
        // Stage and commit all changes
        for (const [filepath] of statusMatrix) {
          await git.add({ fs, dir: repoDir, filepath });
        }
        await git.commit({
          fs,
          dir: repoDir,
          message: "chore: auto-commit changes before switching to dev branch",
          author: {
            name: author.split(" <")[0],
            email: author.split("<")[1]?.replace(">", ""),
          },
        });
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
      await git.checkout({ fs, dir: repoDir, ref: "dev" });
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
 * @param branch The branch to publish (default: "dev").
 */
const publishToGitHubPages = async (branch = "dev") => {
  try {
    const distDir = path.resolve("dist");

    deleteDirectory(distDir);
    console.log("Old dist directory deleted.");

    // Step 1: Copy project files to the new directory
    const projectDir = path.resolve(".");
    await checkoutIndexLike(projectDir, distDir);

    console.log("Project files copied to dist directory.");

    // Step 2: Build the project
    try {
      console.log("Starting build process...");
      const cleanEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PWD: distDir,
        INIT_CWD: distDir,
        npm_config_local_prefix: distDir,
        npm_package_json: path.join(distDir, "package.json"),
        NODE_ENV: "production",
        NEXT_PUBLIC_NODE_ENV: "production",
      };

      console.log("Environment for build:", cleanEnv);

      // Install dependencies
      const installResult = spawnSync(
        "sh",
        ["-c", `cd ${distDir} && npm install`],
        {
          stdio: "inherit",
          env: cleanEnv,
        }
      );

      if (installResult.status !== 0) {
        throw new Error(`npm install failed with code ${installResult.status}`);
      }

      console.log("Dependencies installed in dist directory.");

      // Run the build command
      const buildResult = spawnSync(
        "sh",
        ["-c", `cd ${distDir} && npm run build`],
        {
          stdio: "inherit",
          env: cleanEnv,
        }
      );

      if (buildResult.status !== 0) {
        throw new Error(`npm run build failed with code ${buildResult.status}`);
      }

      console.log("Project built successfully in dist directory.");
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
        path.join(distDir, "out"),
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
};
