"use client";

import "./code-block.css";
import "prism-themes/themes/prism-vsc-dark-plus.css"; // Import Prism CSS
import { Box } from "@mui/material";
import "@fontsource/roboto";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import Footer from "@/components/Footer/Footer";
import siteConfig from "@/config/site-config.json";
import { useSiteMetadata } from "@/contexts/sitemetadata";

interface RootLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: RootLayoutProps) => {
  const { siteMetaData } = useSiteMetadata();

  const basePath = siteConfig.basePath || "";
  const faviconUrl = `${basePath}/favicon.svg`;

  return (
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
  );
};

export default PageLayout;
