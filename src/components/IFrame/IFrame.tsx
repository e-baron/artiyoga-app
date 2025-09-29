import React, { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

interface IFrameProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  children: ReactNode; // React children to render inside the iframe
}

const IFrame: React.FC<IFrameProps> = ({ children, ...props }) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  // Create an Emotion cache for the iframe
  const cache = createCache({
    key: "css",
    container: contentRef?.contentWindow?.document?.head || undefined,
    prepend: true,
  });

  // Collect and inject parent styles into the iframe
  useEffect(() => {
    if (contentRef?.contentWindow?.document) {
      const iframeDoc = contentRef.contentWindow.document;
      const parentHead = document.head;

      // Clone all <style> and <link> tags from the parent document
      Array.from(
        parentHead.querySelectorAll("style, link[rel='stylesheet']")
      ).forEach((styleOrLink) => {
        iframeDoc.head.appendChild(styleOrLink.cloneNode(true));
      });

      // Set overflow: hidden for the <html> tag inside the iframe
      iframeDoc.documentElement.style.overflow = "hidden";

      setMountNode(iframeDoc.body); // Set the mount node for React content
    }
  }, [contentRef]);

  return (
    <iframe {...props} ref={setContentRef}>
      {mountNode &&
        createPortal(
          <CacheProvider value={cache}>{children}</CacheProvider>,
          mountNode
        )}
    </iframe>
  );
};

export default IFrame;