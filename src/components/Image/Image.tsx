import { Box } from "@mui/material";

interface ImageProps {
  height?: string;
  width?: string;
  src: string;
  alt?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  noContainer?: boolean;
  justifyContent?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
}

const Image = ({
  height,
  width,
  src,
  alt = "Image",
  objectFit,
  objectPosition,
  noContainer = false,
  justifyContent = "start",
  alignItems = "center",
  ...rest
}: ImageProps) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = `${basePath}/${src}`.replace("//", "/");

  if (noContainer) {
    return (
      <img
        src={url}
        alt={alt}
        style={{
          maxHeight: height ? height : "100%",
          maxWidth: width ? width : "100%",
          height: height ? height : "100%",
          width: width ? width : "100%",
          objectFit: objectFit ?? "cover",
          objectPosition: objectPosition ?? "center",
        }}
      />
    );
  }

  return (
    <Box
      height={height ? height : "100%"}
      width={width ? width : "100%"}
      display="flex"
      justifyContent={justifyContent}
      alignItems={alignItems}
      overflow="hidden"
      {...rest}
    >
      <img
        src={url}
        alt={alt}
        style={{
          maxHeight: height ? "100%" : "auto",
          maxWidth: "100%",
          height: height ? "100%" : "auto",
          width: width ? "100%" : "auto",
          objectFit: objectFit ?? "cover",
          objectPosition: objectPosition ?? "center",
        }}
      />
    </Box>
  );
};

export default Image;
