"use client";

import "./code-block.css";
import "prism-themes/themes/prism-vsc-dark-plus.css"; // Import Prism CSS
import { Box } from "@mui/material";
import "@fontsource/roboto";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Footer from "@/components/Footer/Footer";
import { SiteMetaData } from "@/types";
import { useEffect, useState } from "react";
import siteConfig from "@/config/site-config.json";
import { SiteMetadataProvider } from "@/contexts/sitemetadata";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  const [siteMetaData, setSiteMetaData] = useState<SiteMetaData>(siteConfig);
  const basePath = siteConfig.basePath || "";
  const faviconUrl = `${basePath}/favicon.svg`;

  /*
  useEffect(() => {
      fetchSiteMetaData();
    }, []);

    const fetchSiteMetaData = async () => {
      try {
        const response = await fetch("/api/site-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "read",
            
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setSiteMetaData(data);
        } else {
          const errorData = await response.json();
          console.error("Error fetching site metadata:", errorData.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };*/

  return (
    <AppRouterCacheProvider>
      <SiteMetadataProvider>
        <ClientThemeProvider>
          <html>
            <head>
              <title>{siteMetaData?.title}</title>
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
        </ClientThemeProvider>
      </SiteMetadataProvider>
    </AppRouterCacheProvider>
  );
};

export default RootLayout;
