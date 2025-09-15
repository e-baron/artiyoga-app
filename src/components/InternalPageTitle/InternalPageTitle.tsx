import { snakeCase } from "lodash";

interface InternalPageTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Title that should be linked to an InternalPageMenuItem. There should be an item
 * with the same value that is given to the InternalPageTitle. In this way, the anchor added to this
 * title will be linked to the InternalPageMenuItem link.
 * @returns
 */
const InternalPageTitle = ({ children }: InternalPageTitleProps) => {
  const internalPageMenuItemId = snakeCase(children?.toString() ?? "");
  return <a id={internalPageMenuItemId}>{children}</a>;
};

export default InternalPageTitle;
