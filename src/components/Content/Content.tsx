import React from "react";
import NestedMdxBlock from "@/components/MdxContent/NestedMdxBlock";
import { Box } from "@mui/material";

interface ContentProps {
  children: React.ReactNode;
  autoMargin?: boolean; 
  fullwidth?: boolean;
  height?: string ;
  style?: React.CSSProperties;
}

/**
 * 
 * @param autoMargin : by default, autoMargin is false (even if not given). If autoMargin is true, there is a padding of 1rem around the content.
 * @returns 
 */

const Content = ({ children, autoMargin, fullwidth, ...rest }: ContentProps) => {
  return (
    <Box
      {...rest}
      className="content-box"
      sx={{
        
        width:  "100%" ,
        minHeight: "10px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        padding: autoMargin ? "1rem" : 0,
        margin: 0,
        "@media (min-width: 992px)": {
          flexBasis: fullwidth ? "100%" : "50%",
          width: fullwidth ? "100%" : "auto",
        },
      }}
    >
      <NestedMdxBlock>{children}</NestedMdxBlock>
    </Box>
  );
};

export default Content;
