import { Dispatch, SetStateAction } from "react";

interface SiteMetaData {
  version: string;
  title: string;
  description: string;
  url: string;
  youtubeUrl?: string;
  authorEmail?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  extraBackgroundText?: string;
  defaultImage?: string;
  menuLinks: Array<{
    name: string;
    link: string;
    subMenu?: Array<{ name: string; link: string }>;
  }>;
}

interface Frontmatter {
  title: string;
  description: string;
  date: string;
}

interface NavigationContextProps {
  activePageMenuItem?: string;
  setActivePageMenuItem: Dispatch<SetStateAction<string>>;
  activePageMenuItemIsVisible?: boolean;
  setActivePageMenuItemIsVisible?: Dispatch<SetStateAction<boolean>>;
}

export type { SiteMetaData, Frontmatter, NavigationContextProps };
