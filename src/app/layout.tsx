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
import fs from "node:fs/promises";
import path from "node:path";

async function getSiteMetaData(): Promise<SiteMetaData & { __version: string }> {
  const cfgPath = path.join(process.cwd(), "src/config/site-config.json");
  const file = await fs.readFile(cfgPath, "utf-8");
  const stat = await fs.stat(cfgPath);
  const json = JSON.parse(file);
  console.log("GOTMETADATA");
  return { ...json, __version: String(stat.mtimeMs) };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const siteMetaData = await getSiteMetaData();
  console.log("SITEMETADATA");

  const basePath = siteMetaData.basePath ?? "";
  const faviconUrl = `${basePath}/favicon.svg`;

  return (
    <AppRouterCacheProvider>
      <ClientThemeProvider>
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
      </ClientThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default RootLayout;
