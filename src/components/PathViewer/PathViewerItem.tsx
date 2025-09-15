import Link from "next/link";
import { snakeCase } from "lodash";

import MUILink from "@mui/material/Link";

interface PathViewerItemProps {
  children: React.ReactNode;
  to: string;
  selected?: boolean;
}

const PathViewerItem = ({ children, to, selected }: PathViewerItemProps) => {
  const itemTextInSnakeCase = snakeCase(children?.toString() ?? "");

  let path = "";
  if (selected) {
    path = "#";
  } else if (to) {
    path = to;
  } else {
    path = "#" + itemTextInSnakeCase;
  }

  if (selected) {
  }

  return (
    <MUILink href={path} underline="hover" color="inherit" component={Link}>
      {children}
    </MUILink>
  );
};

export default PathViewerItem;
