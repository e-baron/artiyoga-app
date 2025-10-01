import "./code-block.css";
import "prism-themes/themes/prism-vsc-dark-plus.css"; // Import Prism CSS
import { Box } from "@mui/material";
import "@fontsource/roboto";
import Header from "@/components/Header/Header";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Footer from "@/components/Footer/Footer";
// import siteMetaData from "@/config/site-config.json";

const getSiteMetaData = async () => {
  const siteMetaData = await import("@/config/site-config.json");
  return siteMetaData.default;
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const siteMetaData = await getSiteMetaData();

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
