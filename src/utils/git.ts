import { execSync } from "child_process";

// Function to handle Git commit operations
const handleGitFileCommit = (filePath: string, sanitizedPagename: string, fileOperationType="add") => {
  try {
    // Check if the "dev" branch exists
    const branches = execSync("git branch", { encoding: "utf8" });
    if (!branches.includes("dev")) {
      // Create the "dev" branch if it doesn't exist
      execSync("git branch dev");
    }

    
    // Switch to the "dev" branch only if not already on it
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    if (currentBranch !== "dev") {
      execSync("git checkout dev");
    }

    // Add all the untracked files (including the new file)
    execSync(`git add .`);

    // Check if there are changes to commit
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (!status) {
      console.log("No changes to commit.");
      return;
    }

    // Commit the file with a message
    console.log(`Committing new file: ${sanitizedPagename}`);
    execSync(`git commit -m "docs: ${fileOperationType} ${sanitizedPagename} (auto-generated)"`);
  } catch (error) {
    console.error("Error handling Git operations:", error);
    if (error instanceof Error) {
      throw new Error(`Git operation failed: ${error.message}`);
    } else {
      throw new Error("Git operation failed: Unknown error");
    }
  }
};

export { handleGitFileCommit };
