"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"; // Import CircularProgress
import { useState, useRef } from "react";

const isDev = process.env.NODE_ENV === "development";

const AddPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state for the button

  // Ref for the form element
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const pagename = formData.get("pagename")?.toString().trim();

    if (!pagename) {
      setErrorMessage("Pagename is required!");
      setSuccessMessage(null);
      return;
    }

    if (isDev) {
      // Call the server function only in development mode
      setLoading(true); // Set loading to true when the button is clicked
      try {
        const response = await fetch("/api/create-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pagename }),
        });

        if (response.ok) {
          setSuccessMessage(`Page "${pagename}" created successfully!`);
          // Clear the form using the ref
          if (formRef.current) {
            formRef.current.reset();
          }
          setErrorMessage(null);
        } else {
          const error = await response.json();
          setErrorMessage(`Error: ${error.message}`);
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error("Error calling server function:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrorMessage(
          "An error occurred while creating the page. " + errorMessage
        );
        setSuccessMessage(null);
      } finally {
        setLoading(false); // Reset loading to false when the API call completes
      }
    } else {
      // In static export mode, just log the pagename
      console.log(`Static export mode: Page "${pagename}" would be created.`);
      setSuccessMessage(
        `Static export mode: Page "${pagename}" would be created.`
      );
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

      <form onSubmit={handleSubmit} ref={formRef}>
        <TextField
          label="Pagename (e.g., products or /contents/day1)"
          name="pagename"
          variant="outlined"
          fullWidth
          required
          sx={{ marginBottom: "1rem" }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading} // Disable the button while loading
          startIcon={loading && <CircularProgress size={20} />} // Add spinner
        >
          {loading ? "Creating..." : "Create Page"}
        </Button>
      </form>
    </Box>
  );
};

export default AddPage;
