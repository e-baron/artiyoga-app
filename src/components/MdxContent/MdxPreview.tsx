import React, { useEffect, useState, useRef } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";

import * as runtime from "react/jsx-runtime";
import shortcodes from "@/utils/mdx";
import { Box, Button, ButtonGroup } from "@mui/material";
import { ClientThemeProvider } from "@/components/ClientThemeProvider/ClientThemeProvider";
import { createRoot } from "react-dom/client";

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

  // Reference to the iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  

  // Function to render the content inside the iframe
  const renderIframeContent = () => {
  if (iframeRef.current && exports) {
    const iframeDoc = iframeRef.current.contentDocument;
    if (iframeDoc) {  

      // Copy styles from the parent document
      const parentStyles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            return ""; // Ignore cross-origin styles
          }
        })
        .join("\n");

      // Write the HTML structure into the iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <style>${parentStyles}</style>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
      iframeDoc.close();

      console.log("Document stylesheets:", document.styleSheets.length);

      // Render the MDX content and toggler inside the iframe
      const root = iframeDoc.getElementById("root");
      if (root) {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <ClientThemeProvider>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/* View Toggle Buttons */}
              <ButtonGroup variant="contained" sx={{ marginBottom: "1rem" }}>
                <Button
                  onClick={() => {
                    setIsMobileView(false);
                    renderIframeContent(); // Re-render for Desktop view
                  }}
                  color={!isMobileView ? "primary" : "inherit"}
                >
                  Desktop
                </Button>
                <Button
                  onClick={() => {
                    setIsMobileView(true);
                    renderIframeContent(); // Re-render for Mobile view
                  }}
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
        );
      }
    }
  }
};

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

  // Render the iframe content when exports are ready
  useEffect(() => {
    if (exports) {
      renderIframeContent();
    }
  }, [exports, isMobileView]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: isMobileView ? "375px" : "1024px", // Mobile width (375px) or Desktop width (1024px)
        height: "100vh", // Full viewport height
        border: "none",
        margin: "0 auto", // Center the iframe horizontally
        display: "block",
      }}
    />
  );
};