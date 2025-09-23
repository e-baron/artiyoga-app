"use client";

import { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { MdxPage } from "@/types";
import MdxContent from "@/components/MdxContent/MdxContent";

const isLocal = process.env.NEXT_PUBLIC_NODE_ENV === "development";

interface EditPageProps {
  page: MdxPage;
}

const EditPage = ({ page }: EditPageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch the raw content of the page using the POST API
  const fetchRawContent = async () => {
    try {
      const response = await fetch("/api/update-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "read",
          slug: page._raw.flattenedPath,
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
    try {
      const response = await fetch("/api/update-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          slug: page._raw.flattenedPath,
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
    }
  };

  return (
    <>
      {/* Edit Button at the top */}
      {!isEditing && isLocal && (
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
        <MdxContent code={page.body.code} />
      ) : (
        <Box sx={{ marginTop: "1rem" }}>
          <CodeMirror
            value={content || ""}
            extensions={[markdown()]} // Enable Markdown syntax highlighting
            onChange={(value) => setContent(value)}
            height="400px"
            theme="light"
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />
          <Box sx={{ marginTop: "1rem" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveContent}
              sx={{ marginRight: "1rem" }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsEditing(false)}
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
