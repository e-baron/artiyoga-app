"use client";
import React, { useEffect, useState } from "react";
import siteConfig from "@/config/site-config.json";

interface LinkFileProps {
  children: React.ReactNode;
  name: string;
}

/**
 * Provide a link to download a file from the public folder.
 *
 * It is also possible to provide as name the source of an external file that shall contain
 * http:// or https:// to get an external link.
 * @param {*} param0
 * @returns
 */
const LinkFile = ({ children, name, ...other }: LinkFileProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV === "development";
  const basePath = isDev ? "" : siteConfig.basePath;

  const url = `${basePath}/${name}`.replace("//", "/");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await fetchFileContent(url);
        setContent(fileContent);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchContent();
  }, []);

  if (
    (name && name.toLowerCase().includes("http://")) ||
    (name && name.toLowerCase().includes("https://"))
  )
    return (
      <a href={name} {...other}>
        {children}
      </a>
    );

  if (error) {
    return <h3 style={{ color: "red" }}>The file {name} does not exist !</h3>;
  }

  if (!content) {
    return <>Loading...</>;
  }

  return (
    <a href={url} {...other}>
      {children}
    </a>
  );
};

async function fetchFileContent(src: string): Promise<string> {
  const response = await fetch(`${src}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${src}`);
  }
  const content = await response.text();
  return content;
}

export default LinkFile;
