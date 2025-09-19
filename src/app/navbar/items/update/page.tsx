import React from "react";

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
import siteConfig from "@/config/site-config.json";
import { MenuLinks } from "@/types";
import { getFilePath, updateFile, readFile } from "@/utils/files";
import { handleGitFileCommit } from "@/utils/git";
import { redirect } from "next/navigation";

const siteConfigPath = getFilePath("src/config/site-config.json");

// Helper function to read and write the site-config.json file
const updateSiteConfig = (updatedMenuLinks: MenuLinks) => {
  const originalConfig = JSON.parse(readFile(siteConfigPath));
  originalConfig.menuLinks = updatedMenuLinks;
  console.log("Updated siteConfig:", originalConfig);
  updateFile(siteConfigPath, JSON.stringify(originalConfig, null, 2));
  handleGitFileCommit(siteConfigPath, "site-config.json", "update");
};

// Helper function to add a new item
const addItem = (
  menuLinks: MenuLinks,
  name: string,
  link: string,
  parentIndex: number | undefined | null,
  index: number | undefined | null,
  protectedItem: boolean,
  isChild: boolean = false
) => {
  console.log("Adding item:", {
    name,
    link,
    parentIndex,
    index,
    protectedItem,
  });
  if (
    parentIndex !== undefined &&
    index !== undefined &&
    parentIndex !== null &&
    index !== null
  ) {
    // Add a new submenu item at the specified index
    const parentItem = menuLinks[parentIndex];

    if (isChild) {
      index = index + 1;
      if (parentItem) {
        parentItem.subMenu = parentItem.subMenu ?? [];
        parentItem.subMenu.splice(index + 1, 0, {
          name,
          link,
          protected: protectedItem,
        });
        return true;
      }
    }

    if (parentItem) {
      parentItem.subMenu = parentItem.subMenu ?? [];
      parentItem.subMenu.splice(index + 1, 0, {
        name,
        link,
        protected: protectedItem,
      });
      return true;
    }
  } else if (parentIndex !== undefined && parentIndex !== null) {
    // If the child index is not provided, check if the
    console.log("isChild:", isChild);
    if (isChild) {
      // Add a new submenu item at the beginning of the submenu
      const parentItem = menuLinks[parentIndex];
      if (parentItem) {
        parentItem.subMenu = parentItem.subMenu ?? [];
        parentItem.subMenu.unshift({
          name,
          link,
          protected: protectedItem,
        });
        return true;
      }
    }
    // Add a new parent item next to the specified parentIndex
    menuLinks.splice(parentIndex + 1, 0, {
      name,
      link,
      protected: protectedItem,
    });
    return true;
  }
  return false;
};

// Helper function to delete an item
const deleteItem = (
  menuLinks: MenuLinks,
  parentIndex: number | null,
  index: number | null
) => {
  if (parentIndex !== null && index !== null) {
    // Delete a submenu item
    const parentItem = menuLinks[parentIndex];
    if (parentItem && parentItem.subMenu) {
      parentItem.subMenu.splice(index, 1);
      return true;
    }
  } else if (parentIndex !== null) {
    // Delete a parent item only if the submenu is empty or doesn't exist
    const parentItem = menuLinks[parentIndex];
    if (
      parentItem &&
      (!parentItem.subMenu || parentItem.subMenu.length === 0)
    ) {
      menuLinks.splice(parentIndex, 1);
      return true;
    } else {
      console.warn("Cannot delete parent item with non-empty submenu.");
      // To be later handled with user feedback display
      throw new Error("Cannot delete parent item with non-empty submenu.");
    }
  }
  return false;
};

const editItem = (
  menuLinks: MenuLinks,
  name: string,
  link: string,
  parentIndex: number | null,
  index: number | null,
  protectedItem: boolean
) => {
  if (parentIndex !== null && index !== null) {
    // Edit a submenu item
    const parentItem = menuLinks[parentIndex];
    if (parentItem && parentItem.subMenu && parentItem.subMenu[index]) {
      parentItem.subMenu[index] = { name, link, protected: protectedItem };
      return true;
    }
  } else if (parentIndex !== null) {
    // Edit a parent item
    if (menuLinks[parentIndex]) {
      menuLinks[parentIndex] = { name, link, protected: protectedItem };
      return true;
    }
  }
  return false;
};

interface UpdateNavbarPageProps {
  /*searchParams: {
    action?: string;
    parentIndex?: string;
    index?: string;
    name?: string;
    link?: string;
    protected?: string;
    successMessage?: string;
  };*/
  // searchParams should become a Promise, as expected by PageProps... but
  // because we use output: 'export' in next.config.js, the Server Component
  // cannot be async (Static Generation).
  // PageProps is not directly compatible, but close enough for our use case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;
}

const UpdateNavbarPage = ({ searchParams }: UpdateNavbarPageProps) => {
  const menuLinks: MenuLinks = siteConfig.menuLinks;
  let errorMessage = "";
  let successMessage = "";
  let success = false;

  // Handle actions synchronously
  if (searchParams.action) {
    const action = searchParams.action;
    const parentIndex = searchParams.parentIndex
      ? Number(searchParams.parentIndex)
      : null;
    const index = searchParams.index ? Number(searchParams.index) : null;
    const name = searchParams.name || "";
    const link = searchParams.link || "";
    const protectedItem = searchParams.protected === "on";
    try {
      if (action === "add" && name) {
        success = addItem(
          menuLinks,
          name,
          link,
          parentIndex,
          index,
          protectedItem
        );
        successMessage = success ? "Item added successfully!" : "";
        updateSiteConfig(menuLinks);
      } else if (action === "add-child" && name) {
        success = addItem(
          menuLinks,
          name,
          link,
          parentIndex,
          index,
          protectedItem,
          true
        );
        successMessage = success ? "Child item added successfully!" : "";
        updateSiteConfig(menuLinks);
      } else if (action === "delete") {
        success = deleteItem(menuLinks, parentIndex, index);
        successMessage = success ? "Item deleted successfully!" : "";
        updateSiteConfig(menuLinks);
      } else if (action === "edit" && name) {
        success = editItem(
          menuLinks,
          name,
          link,
          parentIndex,
          index,
          protectedItem
        );
        successMessage = success ? "Item edited successfully!" : "";
        updateSiteConfig(menuLinks);
      }
    } catch (error) {
      console.error("Error handling action:", error);
      errorMessage = (error as Error).message;
    }
  }

  if (success) {
    // Redirect with a success message passed as a query parameter
    const params = new URLSearchParams();
    params.append("successMessage", successMessage);
    redirect(`/navbar/items/update?${params.toString()}`);
  }

  if (searchParams.successMessage) {
    successMessage = searchParams.successMessage;
  }

  return (
    <Box sx={{ padding: "1rem" }}>
      <h3>Update Navbar Items</h3>
      {errorMessage && (
        <Typography variant="body1" color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}
      {successMessage && (
        <Typography
          variant="body1"
          color="success.main"
          sx={{ marginTop: "1rem" }}
        >
          {successMessage}
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
                  <form method="get" action="/navbar/items/update">
                    <input type="hidden" name="action" value="edit" />
                    <input
                      type="hidden"
                      name="parentIndex"
                      value={parentIndex}
                    />
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
                          defaultChecked={item.protected || false}
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
                  <form method="get" action="/navbar/items/update">
                    <input type="hidden" name="action" value="delete" />
                    <input
                      type="hidden"
                      name="parentIndex"
                      value={parentIndex}
                    />
                    <input type="hidden" name="index" value={undefined} />
                    <Button type="submit" variant="outlined" color="error">
                      Delete
                    </Button>
                  </form>
                  <form method="get" action="/navbar/items/update">
                    <input type="hidden" name="action" value="add" />
                    <input
                      type="hidden"
                      name="parentIndex"
                      value={parentIndex}
                    />
                    <input type="hidden" name="index" value={undefined} />
                    <TextField
                      name="name"
                      defaultValue=""
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <TextField
                      name="link"
                      defaultValue=""
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="protected"
                          defaultChecked={item.protected || false}
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
                      Add Next Item
                    </Button>
                  </form>
                  <form method="get" action="/navbar/items/update">
                    <input type="hidden" name="action" value="add-child" />
                    <input
                      type="hidden"
                      name="parentIndex"
                      value={parentIndex}
                    />
                    <input type="hidden" name="index" value={undefined} />
                    <TextField
                      name="name"
                      defaultValue=""
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <TextField
                      name="link"
                      defaultValue=""
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="protected"
                          defaultChecked={item.protected || false}
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
                      Add Next Child Item
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
              {item.subMenu &&
                item.subMenu.map((subItem, index) => (
                  <TableRow key={`${parentIndex}-${index}`}>
                    <TableCell sx={{ paddingLeft: "2rem" }}>
                      {subItem.name}
                    </TableCell>
                    <TableCell>{subItem.link}</TableCell>
                    <TableCell>{subItem.protected ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <form method="get" action="/navbar/items/update">
                        <input type="hidden" name="action" value="edit" />
                        <input
                          type="hidden"
                          name="parentIndex"
                          value={parentIndex}
                        />
                        <input type="hidden" name="index" value={index} />
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
                              defaultChecked={subItem.protected || false}
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
                      <form method="get" action="/navbar/items/update">
                        <input type="hidden" name="action" value="delete" />
                        <input
                          type="hidden"
                          name="parentIndex"
                          value={parentIndex}
                        />
                        <input type="hidden" name="index" value={index} />
                        <Button type="submit" variant="outlined" color="error">
                          Delete
                        </Button>
                      </form>
                      <form method="get" action="/navbar/items/update">
                        <input type="hidden" name="action" value="add" />
                        <input
                          type="hidden"
                          name="parentIndex"
                          value={parentIndex}
                        />
                        <input type="hidden" name="index" value={index} />
                        <TextField
                          name="name"
                          defaultValue=""
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <TextField
                          name="link"
                          defaultValue=""
                          size="small"
                          sx={{ marginRight: "0.5rem" }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="protected"
                              defaultChecked={subItem.protected || false}
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
                          Add Next Item
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
