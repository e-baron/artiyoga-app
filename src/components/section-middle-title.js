import React from "react";
const SectionMiddleTitle = ({ children, className }) => {
  const classValue = `section__middle-title ${className ? className : ""}`;

  return <div className={classValue}>{children}</div>;
};
export default SectionMiddleTitle;
