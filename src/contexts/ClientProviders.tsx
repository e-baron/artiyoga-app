"use client";

import { ReactNode, useEffect, useState } from "react";
import { SiteMetadataProvider } from "@/contexts/sitemetadata";

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return <SiteMetadataProvider>{children}</SiteMetadataProvider>;
}
