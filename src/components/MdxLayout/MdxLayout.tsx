import Header from "@/components/Header/Header";

import { Frontmatter, SiteMetaData } from "@/types";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";

import React from "react";
import { Container } from "@mui/material";

interface MdxLayoutProps {
  children: React.ReactNode;
  frontmatter?: Frontmatter;
  siteMetaData: SiteMetaData;
}

/**
 * UNUSED COMPONENT ?
 *  By default there is some padding around the content. See later if we want to change this
 * @param param0
 * @returns
 */
const MdxLayout = ({ children, siteMetaData }: MdxLayoutProps) => {
  return (
    <>
      <Header siteMetaData={siteMetaData} />

      <Container
        sx={{ padding: 0, margin: 0, wordWrap: "break-word", backgroundColor:"red" }}
        className="mdx-layout-container"
      >
        {children}
      </Container>
      <ScrollToTop />
    </>
  );
};

export default MdxLayout;
