"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import Footer from "@/components/Footer/Footer";
import { useSiteMetadata } from "@/contexts/sitemetadata";
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

    const fallbackSiteData: SiteMetaData = config;
  if (!mounted) {
    const fallbackSiteData = config as SiteMetaData;
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

  // After mount, render with full context
  return (
    <ClientThemeProvider>
      <ClientProviders>
        <LayoutWithContext>{children}</LayoutWithContext>
      </ClientProviders>
    </ClientThemeProvider>
  );
}

function LayoutWithContext({ children }: { children: React.ReactNode }) {
  const { siteMetaData } = useSiteMetadata();

  if (!siteMetaData) {
    return <div>Loading...</div>;
  }

  return (
    <Box
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
  );
}
