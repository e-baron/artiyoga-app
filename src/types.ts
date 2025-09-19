import { Dispatch, SetStateAction } from "react";


interface SubMenu {
  name: string;
  link: string;
  protected?: boolean;
}

interface MenuItem {
  name: string;
  link: string;
  protected?: boolean;
  subMenu?: SubMenu[];
}

type MenuLinks = MenuItem[];

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
  menuLinks: MenuLinks;
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

export type { SiteMetaData, Frontmatter, NavigationContextProps, MenuLinks };
