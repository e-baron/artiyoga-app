"use client";
import { Container } from "@mui/material";
import plantumlEncoder from "plantuml-encoder";
import { useEffect, useState } from "react";

interface ReactPlantUMLProps {
  src: string;
  alt: string;
}

/**
 * Component that will render a PlantUML diagram from a given path.
 * Note that the image is rendered by the plantuml.com service !!!
 * If there is no internet connection, the image will not be rendered.
 * If the image is very large, an horizontal scrollbar will be displayed.
 * @param src will be the path to the plantuml file that shll be given within the /public folder
 * @returns
 */
const PlantUML = ({ src, alt }: ReactPlantUMLProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const fetchUrl = `${basePath}/${src}`.replace("//", "/");
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await fetchFileContent(fetchUrl);
        const encode = plantumlEncoder.encode(fileContent);
        setContent(encode);
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!content) {
    return <div>Loading...</div>;
  }

  const url = `http://www.plantuml.com/plantuml/svg/${content}`;

  return (
    <Container sx={{ overflowX: "auto" }}>
      <img  alt={alt} src={url} />
    </Container>
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

export default PlantUML;
