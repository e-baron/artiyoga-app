import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React from "react";

interface NestedMdxBlockProps {
  children: React.ReactNode;
}

const NestedMdxBlock = ({ children }: NestedMdxBlockProps) => {
  if (children === undefined || null) return null;

  const childrenAsReactElements = convertAllChildrenToReactElement(children);

  return childrenAsReactElements;
};

const convertAllChildrenToReactElement = (children: React.ReactNode) => {
  const childrenAsReactElements: React.ReactNode[] = [];

  if (Array.isArray(children)) {
    children.forEach((element) => {
      const potentiallyConvertedReactElement =
        getReactElementFromAnyChild(element);
      childrenAsReactElements.push(potentiallyConvertedReactElement);
    });
  } else {
    const potentiallyConvertedReactElement =
      getReactElementFromAnyChild(children);
    childrenAsReactElements.push(potentiallyConvertedReactElement);
  }
  return childrenAsReactElements;
};

const getReactElementFromAnyChild = (child: React.ReactNode) => {
  if (React.isValidElement(child)) {
    return child;
  } else if (typeof child === "string") {
    const markdownStringConvertedToReactElement =
      getReactElementFromMarkdownString(child);
    return markdownStringConvertedToReactElement;
  }
  return null;
};

const getReactElementFromMarkdownString = (markdownString: string) => {
  return (
    <ReactMarkdown
      key={markdownString}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {markdownString}
    </ReactMarkdown>
  );
};

export default NestedMdxBlock;
