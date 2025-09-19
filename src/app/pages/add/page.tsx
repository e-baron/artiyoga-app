import { Box, Button, TextField, Typography } from "@mui/material";
import { handleGitFileCommit } from "@/utils/git";
import { createFile } from "@/utils/files";

const mdxPageDirectory = "mdxPages";

interface AddPageProps {
  // searchParams: { pagename?: string; success?: string; error?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;
}

// Function to sanitize the pagename
const sanitizePagename = (pagename: string): string => {
  return pagename.replace(/[^a-zA-Z0-9-_\/]/g, "");
};

const AddPage = ({ searchParams }: AddPageProps) => {
  let successMessage = "";
  let errorMessage = searchParams.error || "";

  if (searchParams.pagename) {
    const pagename = searchParams.pagename.trim();

    // Sanitize the pagename
    const sanitizedPagename = sanitizePagename(pagename);

    if (sanitizedPagename) {
      try {
        // Create the file
        const filePath = createFile(sanitizedPagename, mdxPageDirectory);

        // Handle Git operations
        handleGitFileCommit(filePath, sanitizedPagename);

        // Set the success message
        successMessage = `Page "${sanitizedPagename}" created successfully!`;
      } catch (error) {
        console.error("Error creating page:", error);
        errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
      }
    }
  }

  return (
    <Box sx={{ padding: "1rem" }}>
      <h3>Add a New Page</h3>
      <form method="get" action="/pages/add">
        <TextField
          label="Pagename (e.g., products or /contents/day1)"
          name="pagename"
          variant="outlined"
          fullWidth
          required
          sx={{ marginBottom: "1rem" }}
        />
        <Button type="submit" variant="contained" color="primary">
          Create Page
        </Button>
      </form>
      {successMessage && (
        <Typography
          variant="body1"
          color="success.main"
          sx={{ marginTop: "1rem" }}
        >
          {successMessage}
        </Typography>
      )}
      {errorMessage && (
        <Typography variant="body1" color="error" sx={{ marginTop: "1rem" }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default AddPage;
