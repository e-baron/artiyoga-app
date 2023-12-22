'use client'

import React, { useState, useEffect, useCallback } from "react";

const Scroll = ({ showBelow }) => {
  const [show, setShow] = useState(showBelow ? false : true);

  const handleScroll = useCallback(() => {
    if (window.scrollY > showBelow && !show) {
      setShow(true);
    } else if (window.scrollY <= showBelow && show) {
      setShow(false);
    }
  }, [show, showBelow]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (showBelow) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, showBelow]);

  return (
    <div>
      {show && (
        <div
          className="scroll scroll--to-top"
          onClick={handleClick}
          aria-label="to top"
        >
          {/* Your content here */}
        </div>
      )}
    </div>
  );
};

export default Scroll;
