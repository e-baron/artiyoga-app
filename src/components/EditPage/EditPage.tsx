"use client";

import { useState } from "react";
import { Button, Typography, Box, Grid, CircularProgress } from "@mui/material"; // Import CircularProgress
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { MdxPage } from "@/types";
import MdxContent from "@/components/MdxContent/MdxContent";
import { MdxPreview } from "@/components/MdxContent/MdxPreview";
import { isDev } from "@/utils/env";

interface EditPageProps {
  page: MdxPage;
}

const EditPage = ({ page }: EditPageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state for the save button

  // Fetch the raw content of the page using the POST API
  const fetchRawContent = async () => {
    try {
      const response = await fetch("/api/update-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "read",
          slug: page._raw?.flattenedPath || "",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setContent(data.code); // Assuming the API returns the raw content in `data.code`
        setIsEditing(true);
        setErrorMessage(null);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to fetch content.");
      }
    } catch (error) {
      console.error("Error fetching raw content:", error);
      setErrorMessage("An error occurred while fetching the content.");
    }
  };

  // Save the updated raw content
  const saveContent = async () => {
    setLoading(true); // Set loading to true when the save button is clicked
    try {
      const response = await fetch("/api/update-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          slug: page._raw?.flattenedPath || "",
          code: content,
        }),
      });
      if (response.ok) {
        setIsEditing(false);
        setSuccessMessage("Content updated successfully!");
        setErrorMessage(null);
      } else {
        const errorData = await response.json();
        setSuccessMessage(null);
        setErrorMessage(errorData.message || "Failed to update content.");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      setSuccessMessage(null);
      setErrorMessage("An error occurred while updating the content.");
    } finally {
      setLoading(false); // Reset loading to false when the API call completes
    }
  };

  return (
    <>
      {/* Edit Button at the top */}
      {!isEditing && isDev() && (
        <Button
          variant="outlined"
          color="primary"
          onClick={fetchRawContent}
          sx={{ margin: "1rem" }}
        >
          Edit Page
        </Button>
      )}

      {/* Success Message */}
      {successMessage && (
        <Typography
          variant="body2"
          color="success.main"
          sx={{ marginTop: "1rem" }}
        >
          {successMessage}
        </Typography>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Typography variant="body2" color="error" sx={{ marginTop: "1rem" }}>
          {errorMessage}
        </Typography>
      )}

      {/* Render the MDX content or the raw content editor */}
      {!isEditing ? (
        page?.body?.code ? (
          <MdxContent code={page.body.code} />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No content available to display.
          </Typography>
        )
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            marginTop: "1rem",
            overflow: "hidden",
            marginLeft: "1rem",
          }}
        >
          <Grid container spacing={2} sx={{ flex: 1, overflow: "hidden" }}>
            {/* Markdown Editor */}
            <Grid size={6} sx={{ height: "100%", overflow: "hidden" }}>
              <CodeMirror
                value={content || ""}
                extensions={[markdown()]} // Enable Markdown syntax highlighting
                onChange={(value) => setContent(value)} // Update content state on change
                theme="light"
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                }}
              />
            </Grid>

            {/* Live MDX Preview */}
            <Grid
              size={6}
              sx={{
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#f9f9f9",
                  height: "100%",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {content ? (
                  <MdxPreview content={content} />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Live preview will appear here.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: "1rem", marginBottom: "2rem" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveContent}
              disabled={loading} // Disable the button while loading
              startIcon={loading && <CircularProgress size={20} />} // Add spinner
              sx={{ marginRight: "1rem" }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsEditing(false)}
              disabled={loading} // Disable cancel button while saving
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default EditPage;
