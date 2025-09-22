import simpleGit, { SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

/**
 * Handles Git commit operations for a specific file. First, if there are uncommitted changes on the current branch, it commits them.
 * Then, it switches to the "dev" branch (creating it if it doesn't exist), adds the specified file, and commits it with a message.
 * @param filePath The path to the file to commit.
 * @param fileOperationType The type of file operation (e.g., "add", "update").
 * @returns void
 */
const handleGitFileCommit = async (
  filePath: string,
  fileOperationType = "add"
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

    // Commit the file with a message
    console.log(`Committing new file: ${filename}`);
    await git.commit(`docs: ${fileOperationType} ${filename} (auto-generated)`);
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
 */
const handleUncommittedChangesAndSwitchToDev = async () => {
  try {
    // Check the current branch
    const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"]);
    if (currentBranch !== "dev") {
      // Check for uncommitted changes
      const status = await git.status();
      if (status.not_added.length > 0 || status.modified.length > 0) {
        // Stage and commit all changes
        await git.add(".");
        await git.commit(
          "chore: auto-commit changes before switching to dev branch"
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

export { handleGitFileCommit, handleUncommittedChangesAndSwitchToDev };