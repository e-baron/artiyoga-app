import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";
import shortcodes from "@/utils/mdx";
import { Box } from "@mui/material";

type MdxViewerProps = { content: string };

// Define the type for the exports returned by the evaluate function
type MDXExports = {
  default: React.ComponentType; // The default export is the MDX component
};

export const MdxViewer = ({ content }: MdxViewerProps) => {
  const [exports, setExports] = useState<MDXExports | null>(null); // Track MDX exports
  const Content = exports?.default || (() => null); // Default to an empty component if not ready

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
    <Box>
      <Content />
    </Box>
  );
};
