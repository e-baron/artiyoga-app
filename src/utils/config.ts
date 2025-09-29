// Function which receive a siteConfig object and returns a new config object with the unpublishedMenuItems and unpublishedPages updated based on input
import { SiteMetaData, UnpublishedMenuItem, UnpublishedPage } from "@/types";

const addUnpublishedMenuItem = (
  siteConfig: SiteMetaData,
  unpublishedMenuItem: UnpublishedMenuItem
) => {
  const newConfig = { ...siteConfig };
  newConfig.unpublishedMenuItems = [
    ...(newConfig.unpublishedMenuItems || []),
    unpublishedMenuItem,
  ];
  return newConfig;
};

const addUnpublishedPage = (
  siteConfig: SiteMetaData,
  unpublishedPage: UnpublishedPage
) => {
  const newConfig = { ...siteConfig };
  newConfig.unpublishedPages = [
    ...(newConfig.unpublishedPages || []),
    unpublishedPage,
  ];
  return newConfig;
};

const addUnpublishedAsset = (
  siteConfig: SiteMetaData,
  unpublishedAsset: { filepath: string; operation: "add" | "delete" }
) => {
  const newConfig = { ...siteConfig };
  newConfig.unpublishedAssets = [
    ...(newConfig.unpublishedAssets || []),
    unpublishedAsset,
  ];
  return newConfig;
};

const clearAllUnpublishedItems = (siteConfig: SiteMetaData) => {
  const newConfig = { ...siteConfig };
  delete newConfig.unpublishedMenuItems;
  delete newConfig.unpublishedPages;
  delete newConfig.unpublishedAssets;
  return newConfig;
};

export {
  addUnpublishedMenuItem,
  addUnpublishedPage,
  addUnpublishedAsset,
  clearAllUnpublishedItems,
};
