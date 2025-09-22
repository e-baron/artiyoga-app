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
  unpublishedMenuItems?: UnpublishedMenuItem[];
  unpublishedPages?: UnpublishedPage[];
}

interface UnpublishedPage{
  name: string;
  operation: "add" | "delete" | "edit";
}

interface UnpublishedMenuItem{
  parentIndex: number;
  index?: number;
  operation: "add" | "add-child" | "delete" | "edit";
  name?: string;
  link?: string;
  protected?: boolean;
}

interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  author?: string;
  autoMargin?: boolean;
  navbarExtraStyles?: string;
  footerExtraStyles?: string;
  headerImage?: string;
  footerImage?: string;
  featuredImage?: string;
  autoCropPage?: boolean;
  category?: string;
  autoFeatureImageAndText?: boolean;
  published?: boolean;
}

interface MdxPage extends Frontmatter {
  body: {
    raw: string;
    code: string;
  };
  _raw: {
    flattenedPath: string;
  };
}

interface NavigationContextProps {
  activePageMenuItem?: string;
  setActivePageMenuItem: Dispatch<SetStateAction<string>>;
  activePageMenuItemIsVisible?: boolean;
  setActivePageMenuItemIsVisible?: Dispatch<SetStateAction<boolean>>;
}

export type {
  SiteMetaData,
  Frontmatter,
  NavigationContextProps,
  MenuLinks,
  MdxPage,
  UnpublishedMenuItem,
  UnpublishedPage,
  MenuItem,
  SubMenu,
};
