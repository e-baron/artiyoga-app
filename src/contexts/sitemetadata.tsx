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
  const [siteMetaData, setSiteMetaData] = useState<SiteMetaData | null>(
    config as SiteMetaData
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

export const useSiteMetadata = () => {
  const context = useContext(SiteMetadataContext);

  // During SSR/static export, context might be undefined
  // Return fallback data instead of throwing
  if (context === undefined) {
    console.warn("SiteMetadataProvider not found, using fallback config");
    return {
      siteMetaData: config as SiteMetaData,
      refetchSiteMetaData: async () => {
        console.warn("refetchSiteMetaData called outside provider context");
      },
    };
  }

  return context;
};
