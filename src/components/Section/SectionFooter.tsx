"use client";

import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";



interface SectionFooterProps {
  children: React.ReactNode;
  light?: boolean;
  dark?: boolean;
}

/**
 * Temporarily discarded as it is a tough component to style properly
 * @param param0 
 * @returns 
 */
const SectionFooter = ({ children, light, dark}: SectionFooterProps) => {
  const theme = useTheme();
  const lightMode = theme.palette.mode === "light";
  if (light ) {
    light = true;
    dark = false;
  } 

  if( dark ) {
    light = false;
    dark = true;
  }

  if (!light && !dark) {
    light = lightMode;
    dark = !lightMode;
  }

    return (
    <Box
      sx={{
        color: light ? 'white' : 'black',
        flex: "1 1 100%",
        textAlign: "center",
        alignSelf: "flex-end",
        justifyContent: "center",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        position: "absolute",
        width: "100%",
        fontFamily: "inherit", // Replace with your theme's font-family if needed
        fontSize: "1.5rem",
        fontWeight: 300,
        "&:nth-last-of-type(2)": {
          bottom: "2.5rem",
        },
        "& + &": {
          position: "relative",
          top: "0rem",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default SectionFooter;
