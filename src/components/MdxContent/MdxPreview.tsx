import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import Frame from "react-frame-component";
import * as runtime from "react/jsx-runtime";
import shortcodes from "@/utils/mdx";
import { Box, Button, ButtonGroup } from "@mui/material";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";

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

  // State to store the parent styles (collected once)
  const [parentStyles, setParentStyles] = useState<string>("");

  // Collect parent styles on the first render
  useEffect(() => {
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (e) {
          console.warn("Skipping cross-origin stylesheet:", styleSheet.href);
          return ""; // Ignore cross-origin styles
        }
      })
      .join("\n");
    setParentStyles(styles);
  }, []);

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
    <Frame
      style={{
        width: isMobileView ? "375px" : "1024px", // Mobile width (375px) or Desktop width (1024px)
        height: "100vh", // Full viewport height
        border: "none",
        overflow: "hidden", // Ensure no extra scrollbars
      }}
      head={<style>{parentStyles}</style>}
    >
      <ClientThemeProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
            overflow: "hidden", // Ensure no extra scrollbars
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
            }}
          >
            <Content />
          </Box>
        </Box>
      </ClientThemeProvider>
    </Frame>
  );
};
