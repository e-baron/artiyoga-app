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

// Default values when context is not available
const defaultSiteMetadata = {
  // Add your default values here
  siteMetaData: (config as SiteMetaData) ?? {},
  refetchSiteMetaData: async () => {},
};

const SiteMetadataContext = createContext(defaultSiteMetadata);

export const SiteMetadataProvider = ({ children }: { children: ReactNode }) => {
  const [siteMetaData, setSiteMetaData] = useState<SiteMetaData>(
    config as SiteMetaData ?? {}
  );

  const refetchSiteMetaData = useCallback(async () => {
    console.log("CONTEXT: Refetching site metadata...");
    try {
      if (!isDev()) return;
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

  useEffect(() => {
    refetchSiteMetaData();
  }, [refetchSiteMetaData]);

  return (
    <SiteMetadataContext.Provider value={{ siteMetaData, refetchSiteMetaData }}>
      {children}
    </SiteMetadataContext.Provider>
  );
};

export function useSiteMetadata() {
  // Check if we're in a browser environment before using the context
  const context = useContext(SiteMetadataContext);

  if (!context) return defaultSiteMetadata;

  return context;
}
