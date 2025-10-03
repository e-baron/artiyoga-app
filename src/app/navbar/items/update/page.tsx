"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { isDev } from "@/utils/env";
import { useSiteMetadata } from "@/contexts/sitemetadata"; // IMPORT THE HOOK

// Define the structure of a menu link
interface MenuLink {
  name: string;
  link: string;
  protected: boolean;
  subMenu?: MenuLink[];
}

// Define the payload type for handleAction
interface ActionPayload {
  parentIndex?: number;
  index?: number;
  name?: string;
  link?: string;
  protected?: boolean;
}

const UpdateNavbarPage = () => {
  // State hooks
  const [menuLinks, setMenuLinks] = useState<MenuLink[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { refetchSiteMetaData } = useSiteMetadata(); // USE THE HOOK
  // Fetch the menu links on component mount
  useEffect(() => {
    const fetchMenuLinks = async () => {
      if (isDev()) {
        try {
          const response = await fetch("/api/update-navbar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "read" }),
          });
          if (response.ok) {
            const data = await response.json();
            setMenuLinks(data.menuLinks);
          } else {
            const error = await response.json();
            setErrorMessage(error.message);
          }
        } catch (error) {
          console.error("Error fetching menu links:", error);
          setErrorMessage("Failed to fetch menu links.");
        }
      }
    };

    fetchMenuLinks();
  }, []);

  const handleAction = async (
    action: string,
    payload: ActionPayload,
    buttonId: string
  ) => {
    if (isDev()) {
      setLoading(buttonId);
      try {
        const response = await fetch("/api/update-navbar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...payload }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuccessMessage(data.message);
          setErrorMessage(null);

          // Update the menuLinks state if provided
          if (data.updatedMenuLinks) {
            setMenuLinks(data.updatedMenuLinks);
          }

          console.log("REFRESHING");
          //router.refresh(); // Will force the layout to reload the config
          await refetchSiteMetaData();
        } else {
          const error = await response.json();
          setErrorMessage(error.message);
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error("Error handling action:", error);
        setErrorMessage("An error occurred while processing the action.");
        setSuccessMessage(null);
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <Box sx={{ padding: "1rem" }}>
      <h3>Update Navbar Items</h3>

      {/* Feedback Messages */}
      {successMessage && (
        <Typography variant="body1" color="success.main" gutterBottom>
          {successMessage}
        </Typography>
      )}
      {errorMessage && (
        <Typography variant="body1" color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Protected</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {menuLinks.map((item, parentIndex) => (
            <React.Fragment key={parentIndex}>
              <TableRow>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.link}</TableCell>
                <TableCell>
                  <Checkbox checked={item.protected} disabled />
                </TableCell>
                <TableCell>
                  {/* Update Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction(
                        "edit",
                        {
                          parentIndex,
                          name: formData.get("name") as string,
                          link: formData.get("link") as string,
                          protected: formData.get("protected") === "on",
                        },
                        `update-${parentIndex}`
                      );
                    }}
                  >
                    <TextField
                      name="name"
                      defaultValue={item.name}
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <TextField
                      name="link"
                      defaultValue={item.link}
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="protected"
                          defaultChecked={item.protected}
                        />
                      }
                      label="Protected"
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      disabled={loading === `update-${parentIndex}`} // Disable while loading
                      startIcon={
                        loading === `update-${parentIndex}` && (
                          <CircularProgress size={20} />
                        )
                      }
                      sx={{ marginRight: "0.5rem" }}
                    >
                      {loading === `update-${parentIndex}`
                        ? "Updating..."
                        : "Update"}
                    </Button>
                  </form>

                  {/* Add Next Item Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction(
                        "add",
                        {
                          parentIndex: parentIndex,
                          name: formData.get("name") as string,
                          link: formData.get("link") as string,
                          protected: formData.get("protected") === "on",
                        },
                        `add-next-${parentIndex}`
                      );
                      e.currentTarget.reset();
                    }}
                  >
                    <TextField
                      name="name"
                      placeholder="Next Item Name"
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <TextField
                      name="link"
                      placeholder="Next Item Link"
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <FormControlLabel
                      control={<Checkbox name="protected" />}
                      label="Protected"
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      disabled={loading === `add-next-${parentIndex}`} // Disable while loading
                      startIcon={
                        loading === `add-next-${parentIndex}` && (
                          <CircularProgress size={20} />
                        )
                      }
                      sx={{ marginRight: "0.5rem" }}
                    >
                      {loading === `add-next-${parentIndex}`
                        ? "Adding..."
                        : "Add Next Item"}
                    </Button>
                  </form>

                  {/* Add Child Item Form*/}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction(
                        "add-child",
                        {
                          parentIndex,
                          name: formData.get("name") as string,
                          link: formData.get("link") as string,
                          index: 0,
                          protected: formData.get("protected") === "on",
                        },
                        `add-child-${parentIndex}`
                      );
                      e.currentTarget.reset();
                    }}
                  >
                    <TextField
                      name="name"
                      placeholder="Child Item Name"
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <TextField
                      name="link"
                      placeholder="Child Item Link"
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <FormControlLabel
                      control={<Checkbox name="protected" />}
                      label="Protected"
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      disabled={loading === `add-child-${parentIndex}`} // Disable while loading
                      startIcon={
                        loading === `add-child-${parentIndex}` && (
                          <CircularProgress size={20} />
                        )
                      }
                      sx={{ marginRight: "0.5rem" }}
                    >
                      {loading === `add-child-${parentIndex}`
                        ? "Adding..."
                        : " Add Child Item"}
                    </Button>
                  </form>

                  {/* Add Delete Item Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAction(
                        "delete",
                        {
                          parentIndex,
                          name: item.name,
                          link: item.link,
                          protected: item.protected,
                        },
                        `delete-${parentIndex}`
                      );
                    }}
                  >
                    <Button
                      type="submit"
                      variant="outlined"
                      color="secondary"
                      disabled={loading === `delete-${parentIndex}`}
                      startIcon={
                        loading === `delete-${parentIndex}` && (
                          <CircularProgress size={20} />
                        )
                      }
                      sx={{ marginRight: "0.5rem" }}
                    >
                      {loading === `delete-${parentIndex}`
                        ? "Deleting..."
                        : "Delete Item"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>

              {/* Render Submenu */}
              {item.subMenu &&
                item.subMenu.map((subItem, index) => (
                  <TableRow key={`${parentIndex}-${index}`}>
                    <TableCell sx={{ paddingLeft: "2rem" }}>
                      {subItem.name}
                    </TableCell>
                    <TableCell>{subItem.link}</TableCell>
                    <TableCell>
                      <Checkbox checked={subItem.protected} disabled />
                    </TableCell>
                    <TableCell>
                      {/* Update Form for Submenu Item */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleAction(
                            "edit",
                            {
                              parentIndex,
                              index,
                              name: formData.get("name") as string,
                              link: formData.get("link") as string,
                              protected: formData.get("protected") === "on",
                            },
                            `edit-${parentIndex}-${index}`
                          );
                        }}
                      >
                        <TextField
                          name="name"
                          defaultValue={subItem.name}
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <TextField
                          name="link"
                          defaultValue={subItem.link}
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="protected"
                              checked={subItem.protected}
                            />
                          }
                          label="Protected"
                        />
                        <Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          disabled={loading === `edit-${parentIndex}-${index}`}
                          startIcon={
                            loading === `edit-${parentIndex}-${index}` && (
                              <CircularProgress size={20} />
                            )
                          }
                          sx={{ marginRight: "0.5rem" }}
                        >
                          {loading === `edit-${parentIndex}-${index}`
                            ? "Updating..."
                            : "Update"}
                        </Button>
                      </form>

                      {/* Add Next Item Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleAction(
                            "add",
                            {
                              parentIndex: parentIndex,
                              index: index,
                              name: formData.get("name") as string,
                              link: formData.get("link") as string,
                              protected: formData.get("protected") === "on",
                            },
                            `add-next-${parentIndex}-${index}`
                          );
                          e.currentTarget.reset();
                        }}
                      >
                        <TextField
                          name="name"
                          placeholder="Next Item Name"
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <TextField
                          name="link"
                          placeholder="Next Item Link"
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <FormControlLabel
                          control={<Checkbox name="protected" />}
                          label="Protected"
                        />
                        <Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          disabled={
                            loading === `add-next-${parentIndex}-${index}`
                          } // Disable while loading
                          startIcon={
                            loading === `add-next-${parentIndex}-${index}` && (
                              <CircularProgress size={20} />
                            )
                          }
                          sx={{ marginRight: "0.5rem" }}
                        >
                          {loading === `add-next-${parentIndex}-${index}`
                            ? "Adding..."
                            : "Add Next Item"}
                        </Button>
                      </form>

                      {/* Delete Submenu Item Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAction(
                            "delete",
                            {
                              parentIndex,
                              index,
                              name: subItem.name,
                              link: subItem.link,
                              protected: subItem.protected,
                            },
                            `delete-${parentIndex}-${index}`
                          );
                        }}
                      >
                        <Button
                          type="submit"
                          variant="outlined"
                          color="secondary"
                          disabled={
                            loading === `delete-${parentIndex}-${index}`
                          }
                          startIcon={
                            loading === `delete-${parentIndex}-${index}` && (
                              <CircularProgress size={20} />
                            )
                          }
                          sx={{ marginRight: "0.5rem" }}
                        >
                          {loading === `delete-${parentIndex}-${index}`
                            ? "Deleting..."
                            : "Delete Item"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default UpdateNavbarPage;
