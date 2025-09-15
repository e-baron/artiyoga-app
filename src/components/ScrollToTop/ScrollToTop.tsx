"use client";
/**
 * ScrollToTop component that only renders a button to scroll to the top of the page.
 * when the user scrolls down. It shall use MUI components.
 */

import React, { useState, useEffect } from "react";
import { Fab } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div>
      {isVisible && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          style={{ position: "fixed", bottom: "2rem", right: "2rem" }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </div>
  );
};

export default ScrollToTop;
