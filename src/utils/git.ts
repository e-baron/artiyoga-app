import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs";
import ghpages from "gh-pages";
import { execSync, spawnSync } from "child_process";
import path from "path";
import { copyProjectFiles, deleteDirectory } from "./files";

const git: SimpleGit = simpleGit();

/**
 * Handles Git commit operations for a specific file. First, if there are uncommitted changes on the current branch, it commits them.
 * Then, it switches to the "dev" branch (creating it if it doesn't exist), adds the specified file, and commits it with a message.
 * @param filePath The path to the file to commit.
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
    // Get the filename from the filePath
    const filename = filePath.split("/").pop();
    if (!filename) {
      throw new Error("Invalid file path provided.");
    }

    // Add the file to staging
    await git.add(filePath);

    // Check if there are changes to commit
    const status = await git.status();
    if (status.staged.length === 0) {
      console.log("No changes to commit.");
      return;
    }

    // Commit the file with a message and custom author
    console.log(`Committing new file: ${filename}`);
    await git.commit(
      `docs: ${fileOperationType} ${filename} (auto-generated)`,
      {
        "--author": author,
      }
    );
  } catch (error) {
    console.error("Error handling Git operations:", error);
    if (error instanceof Error) {
      throw new Error(`Git operation failed: ${error.message}`);
    } else {
      throw new Error("Git operation failed: Unknown error");
    }
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
    // Check the current branch
    const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"]);
    if (currentBranch !== "dev") {
      // Check for uncommitted changes
      const status = await git.status();
      if (status.not_added.length > 0 || status.modified.length > 0) {
        // Stage and commit all changes with a custom author
        await git.add(".");
        await git.commit(
          "chore: auto-commit changes before switching to dev branch",
          {
            "--author": author,
          }
        );
      }

      // Check if the "dev" branch exists
      const branches = await git.branch();
      if (!branches.all.includes("dev")) {
        await git.branch(["dev"]);
      }

      // Switch to the "dev" branch
      await git.checkout("dev");
    }
  } catch (error) {
    console.error("Error handling uncommitted changes:", error);
    if (error instanceof Error) {
      throw new Error(`Uncommitted changes handling failed: ${error.message}`);
    } else {
      throw new Error("Uncommitted changes handling failed: Unknown error");
    }
  }
};

// Operation to merge changes from "dev" to "main" branch
// This function can be expanded as needed
const mergeDevToMain = async (author = "web-app <web-app@example.com>") => {
  try {
    // Ensure we are on the main branch
    await git.checkout("main");

    // Merge dev into main with a squash commit message : "Merge dev into main (auto-generated)" for author
    await git.merge(["--squash", "dev"]);
    await git.commit(`Merge dev into main (auto-generated)`, {
      "--author": author,
    });

    // Push the changes to the remote repository for author
    await git.push("origin", "main");
  } catch (error) {
    console.error("Error merging dev to main:", error);
    if (error instanceof Error) {
      throw new Error(`Merge failed: ${error.message}`);
    } else {
      throw new Error("Merge failed: Unknown error");
    }
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
    copyProjectFiles(distDir);

    console.log("Project files copied to dist directory.");

    // Step 2: Build the project
    try {
      console.log("Starting build process...");

      // Install dependencies
      const installResult = spawnSync("npm", ["install"], {
        cwd: distDir,
        stdio: "inherit", // Inherit stdio to show output in the terminal
        shell: true, // Use a shell to mimic terminal behavior
      });

      if (installResult.status !== 0) {
        throw new Error(`npm install failed with code ${installResult.status}`);
      }

      console.log("Dependencies installed in dist directory.");

      // Run the build command
      const buildResult = spawnSync("npm", ["run", "build"], {
        cwd: distDir,
        stdio: "inherit", // Inherit stdio to show output in the terminal
        shell: true, // Use a shell to mimic terminal behavior
      });

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

export {
  handleGitFileCommit,
  handleUncommittedChangesAndSwitchToDev,
  mergeDevToMain,
  publishToGitHubPages,
};
