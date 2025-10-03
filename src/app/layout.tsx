// Remove "use client" from here - this needs to be a server component

import "./code-block.css";
import "prism-themes/themes/prism-vsc-dark-plus.css";
import "@fontsource/roboto";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ClientLayout from "@/components/ClientLayout/ClientLayout";

// Server component - no "use client"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ArtiYoga</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AppRouterCacheProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
