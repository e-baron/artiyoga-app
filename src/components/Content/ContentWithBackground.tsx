import Image from "@/components/Image/Image";
import { Box } from "@mui/material";

interface BackgroundProps {
  children?: React.ReactNode;
  src?: string;
  autoMargin?: boolean;
}

/**
 *
 * @param autoMargin : by default, autoMargin is false (even if not given). If autoMargin is true, there is a padding of 1rem around the content.
 * @returns
 * @returns
 */

const ContentWithBackground = ({
  children,
  src,
  autoMargin,
  ...rest
}: BackgroundProps) => {
  return (
    <Box
      {...rest}
      className="content-with-background"
      sx={{
        padding: autoMargin ? "1rem" : 0,
        margin: 0,
        display: "flex",
        flexFlow: "row wrap",
        width: "100%",
        minHeight: "10px",
        backgroundSize: "cover",
        position: "relative", // Ensures proper stacking of children
        zIndex: 1, // Optional, depending on your layout needs
      }}
    >
      {src && <Image  src={src}  noContainer/>}
      {children}
    </Box>
  );
};

export default ContentWithBackground;
