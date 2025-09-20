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
} from "@mui/material";

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

const isLocal = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const UpdateNavbarPage = () => {
  // State hooks
  const [menuLinks, setMenuLinks] = useState<MenuLink[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch the menu links on component mount
  useEffect(() => {
    const fetchMenuLinks = async () => {
      if (isLocal) {
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

  const handleAction = async (action: string, payload: ActionPayload) => {
    if (isLocal) {
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
        } else {
          const error = await response.json();
          setErrorMessage(error.message);
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error("Error handling action:", error);
        setErrorMessage("An error occurred while processing the action.");
        setSuccessMessage(null);
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
                  <Checkbox defaultChecked={item.protected} disabled />
                </TableCell>
                <TableCell>
                  {/* Update Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction("edit", {
                        parentIndex,
                        name: formData.get("name") as string,
                        link: formData.get("link") as string,
                        protected: formData.get("protected") === "on",
                      });
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
                      sx={{ marginRight: "0.5rem" }}
                    >
                      Update
                    </Button>
                  </form>

                  {/* Add Next Item Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction("add", {
                        parentIndex: parentIndex,
                        name: formData.get("name") as string,
                        link: formData.get("link") as string,
                        protected: formData.get("protected") === "on",
                      });
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
                      sx={{ marginRight: "0.5rem" }}
                    >
                      Add Next Item
                    </Button>
                  </form>

                  {/* Add Child Item Form*/}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAction("add-child", {
                        parentIndex,
                        name: formData.get("name") as string,
                        link: formData.get("link") as string,
                        protected: formData.get("protected") === "on",
                      });
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
                      sx={{ marginRight: "0.5rem" }}
                    >
                      Add Child Item
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
                      <Checkbox defaultChecked={subItem.protected} disabled />
                    </TableCell>
                    <TableCell>
                      {/* Update Form for Submenu Item */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleAction("edit", {
                            parentIndex,
                            index,
                            name: formData.get("name") as string,
                            link: formData.get("link") as string,
                            protected: formData.get("protected") === "on",
                          });
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
                              defaultChecked={subItem.protected}
                            />
                          }
                          label="Protected"
                        />
                        <Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          sx={{ marginRight: "0.5rem" }}
                        >
                          Update
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
