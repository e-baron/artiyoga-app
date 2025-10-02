"use client";

import "./code-block.css";
import "prism-themes/themes/prism-vsc-dark-plus.css";
import { Box } from "@mui/material";
import "@fontsource/roboto";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Footer from "@/components/Footer/Footer";
import { SiteMetadataProvider, useSiteMetadata } from "@/contexts/sitemetadata";

// This component consumes the context and renders the layout
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { siteMetaData } = useSiteMetadata();

  if (!siteMetaData) {
    // You can render a loading spinner here while the initial fetch happens
    return null;
  }

  const basePath = siteMetaData.basePath || "";
  const faviconUrl = `${basePath}/favicon.svg`;

  return (
    <html>
      <head>
        <title>{siteMetaData.title}</title>
        <link rel="icon" type="image/svg+xml" href={faviconUrl} />
      </head>
      <Box
        component="body"
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
        }}
      >
        <Header siteMetaData={siteMetaData} />
        <Box
          sx={{ padding: 0, margin: 0, wordWrap: "break-word", flex: 1 }}
          className="app-layout-box"
        >
          {children}
        </Box>
        <ScrollToTop />
        <Footer siteMetaData={siteMetaData} />
      </Box>
    </html>
  );
};

// The RootLayout now only sets up providers
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppRouterCacheProvider>
      <ClientThemeProvider>
        <SiteMetadataProvider>
          <MainLayout>{children}</MainLayout>
        </SiteMetadataProvider>
      </ClientThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default RootLayout;
