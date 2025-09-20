"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
            console.log("Fetched menu links:", data.menuLinks);
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
                <TableCell>{item.protected ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {/* Edit Action */}
                  <Button
                    onClick={() =>
                      handleAction("edit", {
                        parentIndex,
                        name: item.name,
                        link: item.link,
                        protected: item.protected,
                      })
                    }
                    variant="outlined"
                    color="primary"
                  >
                    Edit
                  </Button>

                  {/* Delete Action */}
                  <Button
                    onClick={() => handleAction("delete", { parentIndex })}
                    variant="outlined"
                    color="error"
                  >
                    Delete
                  </Button>

                  {/* Add Next Item */}
                  <Button
                    onClick={() =>
                      handleAction("add", {
                        parentIndex,
                        name: "New Item",
                        link: "/new-item",
                        protected: false,
                      })
                    }
                    variant="outlined"
                    color="primary"
                  >
                    Add Next Item
                  </Button>

                  {/* Add Child Item */}
                  <Button
                    onClick={() =>
                      handleAction("add-child", {
                        parentIndex,
                        name: "New Child",
                        link: "/new-child",
                        protected: false,
                      })
                    }
                    variant="outlined"
                    color="primary"
                  >
                    Add Child Item
                  </Button>
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
                    <TableCell>{subItem.protected ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {/* Edit Submenu Item */}
                      <Button
                        onClick={() =>
                          handleAction("edit", {
                            parentIndex,
                            index,
                            name: subItem.name,
                            link: subItem.link,
                            protected: subItem.protected,
                          })
                        }
                        variant="outlined"
                        color="primary"
                      >
                        Edit
                      </Button>

                      {/* Delete Submenu Item */}
                      <Button
                        onClick={() =>
                          handleAction("delete", { parentIndex, index })
                        }
                        variant="outlined"
                        color="error"
                      >
                        Delete
                      </Button>
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
