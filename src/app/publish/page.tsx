"use client";

import {
  MenuLinks,
  UnpublishedAsset,
  UnpublishedMenuItem,
  UnpublishedPage,
} from "@/types";

import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";

import { useEffect, useState } from "react";
import { isDev } from "@/utils/env";

const PublishPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unpublishedPages, setUnpublishedPages] = useState<UnpublishedPage[]>(
    []
  );
  const [unpublishedMenuItems, setUnpublishedMenuItems] = useState<
    UnpublishedMenuItem[]
  >([]);
  const [unpublishedAssets, setUnpublishedAssets] = useState<
    UnpublishedAsset[]
  >([]);
  const [menuLinks, setMenuLinks] = useState<MenuLinks>([]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchUnpublishedItems = async () => {
      if (isDev()) {
        try {
          const response = await fetch("/api/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "read config" }),
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched unpublished items:", data);
            setUnpublishedMenuItems(data.unpublishedMenuItems ?? []);
            setUnpublishedPages(data.unpublishedPages ?? []);
            setUnpublishedAssets(data.unpublishedAssets ?? []);
            setMenuLinks(data.menuLinks ?? []);
          } else {
            const error = await response.json();
            setErrorMessage(error.message);
          }
        } catch (error) {
          console.error("Error fetching unpublished items:", error);
          setErrorMessage("Failed to fetch unpublished items.");
        }
      }
    };

    fetchUnpublishedItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDev) {
      setErrorMessage("Publishing is only available in development mode.");
      return;
    }

    setLoading(true); 

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish all" }),
      });

      if (response.ok) {
        setSuccessMessage("All unpublished items have been published.");
        setErrorMessage(null);
        setUnpublishedMenuItems([]);
        setUnpublishedPages([]);
        setUnpublishedAssets([]);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to publish items.");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error("Error publishing items:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(
        "An error occurred while publishing items. " + errorMessage
      );
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isDev) {
    return null;
  }

  return (
    <Box sx={{ padding: "1rem" }}>
      <h3>Publish all items</h3>

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

      <h4>Unpublished Pages</h4>
      {unpublishedPages.length === 0 && <p>No unpublished pages.</p>}
      {unpublishedPages.map((page, index) => (
        <Box key={index} sx={{ marginBottom: "0.5rem" }}>
          <TextField
            label={`Page: ${page.name}`}
            value={page.operation}
            slotProps={{
              input: { readOnly: true },
            }}
            variant="outlined"
            fullWidth
          />
        </Box>
      ))}

      <h4>Unpublished Assets</h4>
      {unpublishedAssets.length === 0 && <p>No unpublished assets.</p>}
      {unpublishedAssets.map((asset, index) => (
        <Box key={index} sx={{ marginBottom: "0.5rem" }}>
          <TextField
            label={`Asset: ${asset.filepath}`}
            value={asset.operation}
            slotProps={{
              input: { readOnly: true },
            }}
            variant="outlined"
            fullWidth
          />
        </Box>
      ))}

      <h4>Unpublished Menu Items</h4>
      {unpublishedMenuItems.length === 0 && <p>No unpublished menu items.</p>}
      {unpublishedMenuItems.map((item, index) => {
        return (
          <Box key={index} sx={{ marginBottom: "0.5rem" }}>
            <TextField
              label={`Menu Item: ${item.name} ${item.link}`}
              value={item.operation}
              slotProps={{
                input: { readOnly: true },
              }}
              variant="outlined"
              fullWidth
            />
          </Box>
        );
      })}

      <br />

      {unpublishedMenuItems.length > 0 ||
      unpublishedPages.length > 0 ||
      unpublishedAssets.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading} // Disable the button while loading
            startIcon={loading && <CircularProgress size={20} />} // Add spinner
          >
            {loading ? "Publishing..." : "Publish All"}
          </Button>
        </form>
      ) : null}
    </Box>
  );
};

export default PublishPage;
