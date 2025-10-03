"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { SiteMetaData } from "@/types";
import config from "@/config/site-config.json";
import { isDev } from "@/utils/env";

interface SiteMetadataContextType {
  siteMetaData: SiteMetaData | null;
  refetchSiteMetaData: () => Promise<void>;
}

const SiteMetadataContext = createContext<SiteMetadataContextType | undefined>(
  undefined
);

export const SiteMetadataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with the static import, but it will be quickly replaced by the fetch.
  const [siteMetaData, setSiteMetaData] = useState<SiteMetaData | null>(
    config as SiteMetaData
  );

  const refetchSiteMetaData = useCallback(async () => {
    console.log("CONTEXT: Refetching site metadata...");
    try {
      if (!isDev()) return
      const response = await fetch("/api/site-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setSiteMetaData(data);
      } else {
        console.error("CONTEXT: Failed to fetch site metadata.");
      }
    } catch (error) {
      console.error("CONTEXT: Error during fetch:", error);
    }
  }, []);

  // Fetch data on initial mount
  useEffect(() => {
    refetchSiteMetaData();
  }, [refetchSiteMetaData]);

  return (
    <SiteMetadataContext.Provider value={{ siteMetaData, refetchSiteMetaData }}>
      {children}
    </SiteMetadataContext.Provider>
  );
};

export const useSiteMetadata = () => {
  const context = useContext(SiteMetadataContext);
  if (context === undefined) {
    throw new Error(
      "useSiteMetadata must be used within a SiteMetadataProvider"
    );
  }
  return context;
};
