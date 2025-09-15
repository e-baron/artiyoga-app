"use client";
import { Carousel as ReactCarousel } from "react-responsive-carousel";
import { allPages } from "contentlayer/generated";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 *
 * @param {*} param0
 * @returns
 */

interface CarouselProps {
  backgroundImageName?: string;
  folderNameWithMdxFiles?: string;
}

const Carousel = ({
  backgroundImageName,
  folderNameWithMdxFiles = "testimonial",
}: CarouselProps) => {
  const theme = useTheme();

  const testimonials = allPages.filter((mdxPage) =>
    mdxPage._raw?.sourceFilePath.includes(folderNameWithMdxFiles)
  );

  if (!testimonials || testimonials.length === 0) return null;

  const carousel = (
    <ReactCarousel
      infiniteLoop={true}
      useKeyboardArrows={true}
      autoPlay={true}
      interval={5000}
      showStatus={false}
      showThumbs={false}
    >
      {testimonials?.map((testimonial, index) => (
        <div key={index}>
          <p>{testimonial.body.raw}</p>
          {testimonial.author && <h4>{testimonial.author}</h4>}
        </div>
      ))}
    </ReactCarousel>
  );

  if (backgroundImageName) {
    return (
      <Box
        sx={{
          backgroundImage: `url(${backgroundImageName})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          backgroundColor: theme.palette.secondary.main, // Secondary color for background
          color: theme.palette.secondary.contrastText, // Contrast color for text
          "& .carousel .control-dots .dot": {
            backgroundColor: theme.palette.primary.main, // Primary color for dots
          },
          "& .carousel .control-arrow": {
            color: theme.palette.primary.main, // Primary color for arrows
          },
        }}
      >
        {carousel}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.secondary.main, // Secondary color for background
        color: theme.palette.secondary.contrastText, // Contrast color for text
        "& .carousel .control-dots .dot": {
          backgroundColor: theme.palette.primary.main, // Primary color for dots
        },
        "& .carousel .control-arrow": {
          color: theme.palette.primary.main, // Primary color for arrows
        },
        width: "100%",
      }}
    >
      {carousel}
    </Box>
  );
};

export default Carousel;
