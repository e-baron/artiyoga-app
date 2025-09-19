"use client";

import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

const isLocal = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const AddPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const pagename = formData.get("pagename")?.toString().trim();

    if (!pagename) {
      setErrorMessage("Pagename is required!");
      setSuccessMessage(null);
      return;
    }

    if (isLocal) {
      // Call the server function only in development mode
      try {
        const response = await fetch("/api/create-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pagename }),
        });

        if (response.ok) {
          setSuccessMessage(`Page "${pagename}" created successfully!`);
          setErrorMessage(null);
        } else {
          const error = await response.json();
          setErrorMessage(`Error: ${error.message}`);
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error("Error calling server function:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setErrorMessage("An error occurred while creating the page. " + errorMessage);
        setSuccessMessage(null);
      }
    } else {
      // In static export mode, just log the pagename
      console.log(`Static export mode: Page "${pagename}" would be created.`);
      setSuccessMessage(`Static export mode: Page "${pagename}" would be created.`);
      setErrorMessage(null);
    }
  };

  return (
    <Box sx={{ padding: "1rem" }}>
      <h3>Add a New Page</h3>

      {/* Feedback Box */}
      {(successMessage || errorMessage) && (
        <Box
          sx={{
            marginBottom: "1rem",
            padding: "1rem",
            borderRadius: "4px",
            backgroundColor: successMessage ? "green" : "red",
            color: "white",
          }}
        >
          <Typography variant="body1">
            {successMessage || errorMessage}
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
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
    </Box>
  );
};

export default AddPage;