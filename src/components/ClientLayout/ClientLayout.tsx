"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import Footer from "@/components/Footer/Footer";
import ClientProviders from "@/contexts/ClientProviders";
import config from "@/config/site-config.json";
import { SiteMetaData } from "@/types";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/static export, render basic layout with fallback data
  const fallbackSiteData = config as SiteMetaData;

  if (!mounted) {
    return (
      <ClientThemeProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
          }}
        >
          <Header siteMetaData={fallbackSiteData} />
          <Box
            sx={{ padding: 0, margin: 0, wordWrap: "break-word", flex: 1 }}
            className="app-layout-box"
          >
            {children}
          </Box>
          <ScrollToTop />
          <Footer siteMetaData={fallbackSiteData} />
        </Box>
      </ClientThemeProvider>
    );
  }

  // After hydration, render with providers but still use fallback data
  // Don't use context in layout - let individual components decide
  return (
    <ClientThemeProvider>
      <ClientProviders>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
          }}
        >
          <Header siteMetaData={fallbackSiteData} />
          <Box
            sx={{ padding: 0, margin: 0, wordWrap: "break-word", flex: 1 }}
            className="app-layout-box"
          >
            {children}
          </Box>
          <ScrollToTop />
          <Footer siteMetaData={fallbackSiteData} />
        </Box>
      </ClientProviders>
    </ClientThemeProvider>
  );
}
