"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
  IconButton,
} from "@mui/material";
import { SiteMetaData } from "@/types";
import MenuIcon from "@mui/icons-material/Menu";

import { useTheme } from "@mui/material/styles";
import DarkLightToggler from "../DarkLightToggler/DarkLightToggler";
import { isDev } from "@/utils/env";

interface NavbarProps {
  siteMetaData: SiteMetaData;
}

/**
 * Render a Navbar with the given siteMetaData.
 * The Navbar has to be responsive.
 * If the navigation items are too many, the Navbar should be able to collapse.
 * @param siteMetaData will be the metadata of the site, containing the title and the menu links.
 * @returns
 */

const Navbar = ({ siteMetaData }: NavbarProps) => {
  const drawerWidth = 240;
  const theme = useTheme();
  const [anchorEls, setAnchorEls] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen((prevState) => !prevState);
  };

  const handleMenu = (
    event: React.MouseEvent<HTMLElement>,
    linkName: string
  ) => {
    setAnchorEls((prev) => ({ ...prev, [linkName]: event.currentTarget }));
  };

  const handleClose = (linkName: string) => {
    setAnchorEls((prev) => ({ ...prev, [linkName]: null }));
  };

  const drawer = (
    <Box id="drawer" onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Button
        key="homeBtn2"
        onClick={() => handleClose("home2")}
        href="/"
        LinkComponent={Link}
      >
        <Typography
          variant="h6"
          sx={{ my: 2, color: theme.palette.primary.contrastText }}
        >
          {siteMetaData.title}
        </Typography>
      </Button>

      <Divider />
      <List sx={{ display: "block" }}>
        {siteMetaData.menuLinks.map((link) => {
          if (
            !link.subMenu &&
            (!link.protected || (link.protected && isDev()))
          ) {
            return (
              <ListItem
                key={link.link}
                disablePadding
                sx={{ display: "block" }}
              >
                <ListItemButton
                  href={link.link === "" ? "#" : link.link}
                  LinkComponent={Link}
                  sx={{ textAlign: "left", width: "100%", display: "block" }}
                  onClick={(event) => handleMenu(event, link.name)}
                >
                  <ListItemText
                    primary={link.name}
                    sx={{ width: "100%", display: "block" }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }
          // Submenu
          if (link && (!link.protected || (link.protected && isDev())))
            return (
              <ListItem
                key={"drawer" + link.name}
                disablePadding
                sx={{ display: "block" }}
              >
                <ListItemButton
                  sx={{ textAlign: "left", width: "100%", display: "block" }}
                >
                  <ListItemText
                    primary={link.name}
                    sx={{ width: "100%", display: "block" }}
                  />
                </ListItemButton>

                <List sx={{ paddingLeft: 2, display: "block" }}>
                  {link.subMenu &&
                    (!link.protected || (link.protected && isDev())) &&
                    link.subMenu.map((subLink) => (
                      <ListItem key={"drawer" + subLink.name} disablePadding>
                        <ListItemButton
                          sx={{
                            textAlign: "left",
                            width: "100%",
                            display: "block",
                          }}
                          href={subLink.link}
                          LinkComponent={Link}
                        >
                          <ListItemText
                            primary={subLink.name}
                            sx={{ width: "100%", display: "block" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              </ListItem>
            );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Button
            key="homeBtn"
            onClick={() => handleClose("home")}
            href="/"
            LinkComponent={Link}
            sx={{
              flexGrow: 1,
              display: { sm: "block" },
              color: theme.palette.primary.contrastText,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { sm: "block" } }}
            >
              {siteMetaData.title}
            </Typography>
          </Button>

          <DarkLightToggler />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {siteMetaData.menuLinks.map((link) => (
              <Box key={link.name} sx={{ display: "inline" }}>
                {link.subMenu &&
                (!link.protected || (link.protected && isDev())) ? (
                  <>
                    <Button
                      color="inherit"
                      onClick={(event) => handleMenu(event, link.name)}
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      {link.name}
                    </Button>

                    <Menu
                      key={link.link}
                      anchorEl={anchorEls[link.name]}
                      open={Boolean(anchorEls[link.name])}
                      onClose={() => handleClose(link.name)}
                      color="inherit"
                    >
                      {link.subMenu.map((subLink) => (
                        <Button
                          key={subLink.name}
                          onClick={() => handleClose(link.name)}
                          href={subLink.link === "" ? "#" : subLink.link}
                          LinkComponent={Link}
                          sx={{ display: "block", width: "100%" }}
                        >
                          {subLink.name}
                        </Button>
                      ))}
                    </Menu>
                  </>
                ) : (
                  (!link.protected || (link.protected && isDev())) && (
                    <Button
                      href={link.link === "" ? "#" : link.link}
                      LinkComponent={Link}
                      color="inherit"
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      {link.name}
                    </Button>
                  )
                )}
              </Box>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: `${!drawerOpen ? "none" : "display"}` },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default Navbar;
