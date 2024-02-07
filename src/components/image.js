import React from "react";
import NextImage from "next/image";

const Image = ({
  children,
  src,
  alt,
  width,
  height,
  display,
  path,
  className,
  objectFit="cover",
}) => {

  return (
    <div
      className={className}
      style={{
        width: width ?? "100%",
        height: height ?? "100%",
        display: display ?? "block",
        position: "absolute", // absolute and almost no issues...
        // overflow: "hidden",
        zIndex: 0,
        paddingLeft: "inherit",
        paddingRight: "inherit",
        left: 0,
        right: 0,
      }}
    >
      <NextImage
        src={
          src
            ? process.env.BASE_PATH + src
            : `{process.env.BASE_PATH}/images/icon.png`
        }
        sizes="200px"
        fill
        style={{
          objectFit: objectFit,
          padding:"inherit"
        }}
        alt="Picture of the author"
      />
    </div>
  );
};

export default Image;
