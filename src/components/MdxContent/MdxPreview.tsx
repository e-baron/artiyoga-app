import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";

import * as runtime from "react/jsx-runtime";
import shortcodes from "@/utils/mdx";

type MdxPreviewProps = { content: string };

// Define the type for the exports returned by the evaluate function
type MDXExports = {
  default: React.ComponentType; // The default export is the MDX component
};

export const MdxPreview = ({ content }: MdxPreviewProps) => {
  const exports = useMDX(content);
  const Content = exports.default;

  return <Content />;
};

function useMDX(content: string): MDXExports {
  const [exports, setExports] = useState<MDXExports>({
    default: runtime.Fragment,
  });

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
        setExports(evaluated as MDXExports); // Update the exports only if evaluation succeeds
      } catch (error) {
        console.error("Error evaluating MDX content:", error);
        // Do nothing, retain the previous content
      }
    };

    evaluateMDX();
  }, [content]);

  return exports;
}
