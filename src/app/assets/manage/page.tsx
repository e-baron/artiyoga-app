"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ManageAssetsPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filepath, setFilepath] = useState<string>(""); // State for the filepath
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null); // Track which button is loading
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the list of assets
  const fetchAssets = async () => {
    setLoading("fetch"); // Set loading for the fetch operation
    setError(null);
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "read" }),
      });

      const data = await response.json();
      if (data.fileNames) {
        setAssets(data.fileNames);
      } else {
        setError("Failed to fetch assets.");
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("An error occurred while fetching assets.");
    } finally {
      setLoading(null); // Reset loading
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (!filepath) {
      setError("Please specify the file path.");
      return;
    }

    setLoading("upload"); // Set loading for the upload operation
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "create");
      formData.append("filepath", filepath); // Use the filepath provided in the form

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        fetchAssets(); // Refresh the asset list
      } else {
        setError(data.error || "Failed to upload the file.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(null); // Reset loading
    }
  };

  // Handle file deletion
  const handleDelete = async (filepath: string) => {
    setLoading(filepath); // Set loading for the specific delete operation
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", filepath }),
      });

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        fetchAssets(); // Refresh the asset list
      } else {
        setError(data.error || "Failed to delete the file.");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("An error occurred while deleting the file.");
    } finally {
      setLoading(null); // Reset loading
    }
  };

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Helper function to calculate padding based on directory depth
  const getPadding = (filepath: string): number => {
    const depth = filepath.split("/").length - 1; // Calculate depth based on slashes
    return depth * 16; // Each level adds 16px of padding
  };

  return (
    <Box sx={{ padding: "1rem" }}>
      <Typography variant="h4" gutterBottom>
        Manage Assets
      </Typography>

      {/* File Upload Form */}
      <Box
        component="form"
        onSubmit={handleFileUpload}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Typography variant="h6">Upload a New Asset</Typography>
        <TextField
          label="File Path"
          value={filepath}
          onChange={(e) => setFilepath(e.target.value)} // Update the filepath state
          placeholder="e.g., public/uploads/myfile.txt"
          fullWidth
        />
        <TextField
          type="file"
          onChange={(e) => {
            const input = e.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
            setFile(input.files?.[0] || null); // Access the files property
          }}
          inputProps={{ accept: "*" }} // Accept all file types
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading === "upload"} // Disable while uploading
          startIcon={loading === "upload" && <CircularProgress size={20} />} // Add spinner
          sx={{ alignSelf: "flex-start", width: "200px" }} // Restrict button width
        >
          {loading === "upload" ? "Uploading..." : "Upload"}
        </Button>
      </Box>

      {/* Messages */}
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Asset List */}
      <Typography variant="h6" gutterBottom>
        Current Assets
      </Typography>
      {loading === "fetch" ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset}>
                  <TableCell>
                    <span
                      style={{
                        display: "inline-block",
                        paddingLeft: `${getPadding(asset)}px`, // Add padding based on depth
                      }}
                    >
                      {asset}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(`public/${asset}`)}
                      disabled={loading === `public/${asset}`} // Disable while deleting
                    >
                      {loading === `public/${asset}` ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ManageAssetsPage;
