import React from "react";
import NestedMdxBlock from "./mdx/nested-mdx-block";

const Content = ({ children, className, ...rest }) => {
  const classValue = `section__content ${className ? className : ""}`;

  return (
    <div className={classValue} {...rest}>
      <NestedMdxBlock>{children}</NestedMdxBlock>
    </div>
  );
};
export default Content;
