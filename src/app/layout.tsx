"use client";

import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import PageLayout from "@/components/PageLayout/PageLayout";
import { SiteMetadataProvider } from "@/contexts/sitemetadata";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <AppRouterCacheProvider>
      <SiteMetadataProvider>
        <ClientThemeProvider>
          <PageLayout>{children}</PageLayout>
        </ClientThemeProvider>
      </SiteMetadataProvider>
    </AppRouterCacheProvider>
  );
};

export default RootLayout;
