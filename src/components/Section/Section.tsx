import React from "react";
import { Box } from "@mui/material";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  autoMargin?: boolean; // if true, we add a padding of 1rem around the content. By default, autoMargin is true.
}

/**
 * 
 * @param autoMargin : by default, autoMargin is true (even if not given). If autoMargin is false, there is no padding around the content.
 * @returns 
 */
const Section = ({ children, className, autoMargin }: SectionProps) => {
  return (
    <Box
      className="section-box"
      sx={{
        display: "flex",
        flexFlow: "row wrap",
        width: "100%",
        minHeight: "10px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        /* paddingTop: className?.includes("section--auto-margin") ? "1rem" : "0",
        paddingLeft: className?.includes("section--auto-margin") ? "1rem" : "0",
        paddingRight: className?.includes("section--auto-margin") ? "1rem" : "0",*/
        padding: autoMargin !== false ? "1rem" : 0,
        justifyContent: className?.includes("section__content--center")
          ? "center"
          : "flex-start",
        textAlign: className?.includes("section__content--center")
          ? "center"
          : "left",
        "@media (min-width: 992px)": {
          flexBasis: className?.includes("section__content") ? "50%" : "auto",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default Section;
