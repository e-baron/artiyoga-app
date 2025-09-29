import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";
import shortcodes from "@/utils/mdx";
import { Box, Button, ButtonGroup } from "@mui/material";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import IFrame from "@/components/IFrame/IFrame";

type MdxPreviewProps = { content: string };

// Define the type for the exports returned by the evaluate function
type MDXExports = {
  default: React.ComponentType; // The default export is the MDX component
};

export const MdxPreview = ({ content }: MdxPreviewProps) => {
  const [exports, setExports] = useState<MDXExports | null>(null); // Track MDX exports
  const Content = exports?.default || (() => null); // Default to an empty component if not ready

  // State to toggle between "Desktop" and "Mobile" views
  const [isMobileView, setIsMobileView] = useState(false); // Default to Desktop view





  // Load the MDX content
  useEffect(() => {
    const evaluateMDX = async () => {
      try {
        // Remove frontmatter using regex
        const mdxContent = content.replace(/^---[\s\S]*?---/, "").trim();

        const evaluated = await evaluate(mdxContent, {
          ...runtime,
          useMDXComponents: () => ({
            ...useMDXComponents(),
            ...shortcodes,
          }),
        });
        setExports(evaluated as MDXExports); // Update the exports when evaluation completes
      } catch (error) {
        console.error("Error evaluating MDX content:", error);
      }
    };

    evaluateMDX();
  }, [content]);

  return (
     
    <IFrame
      style={{
        width: isMobileView ? "375px" : "100%",
        height: "100%",
        border: "1px solid #ccc",
        overflow: "hidden",  
        borderRadius: isMobileView ? "20px" : "0", // Rounded corners for mobile view
        boxShadow: isMobileView
          ? "0 4px 12px rgba(0, 0, 0, 0.1)"
          : "none", // Subtle shadow for mobile view
      }}
    ><Box
          sx={{
            display: "flex",
            justifyContent: "center", 
            flexDirection: "column",
            alignItems: "center", 
            width: "100%", 
            marginBottom: "1rem",
            overflow: "hidden",
            height: "100%",
          }}
        >
      
        {/* View Toggle Buttons */}
        <ButtonGroup variant="contained" sx={{ marginBottom: "1rem" }}>
          <Button
            onClick={() => setIsMobileView(false)}
            color={!isMobileView ? "primary" : "inherit"}
          >
            Desktop
          </Button>
          <Button
            onClick={() => setIsMobileView(true)}
            color={isMobileView ? "primary" : "inherit"}
          >
            Mobile
          </Button>
        </ButtonGroup>

        {/* Render the MDX content */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            padding: "1rem",
            overflowY: "auto", // Single scrollbar for the iframe content
            overflowX: "hidden", // Prevent horizontal overflow
          }}
        >
          <Content />
        </Box>
   </Box>
    </IFrame>
  );
};
