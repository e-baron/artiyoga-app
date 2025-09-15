import Link from "next/link";
import { snakeCase } from "lodash";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MUILink from "@mui/material/Link";

interface InternalPageMenuItemProps {
  children: string;
  to: string;
}

const InternalPageMenuItem = ({ children, to }: InternalPageMenuItemProps) => {
  const itemTextInSnakeCase = snakeCase(children);

  return (
    <ListItem component="div" sx={{ paddingTop: 0, paddingBottom: 0 }}>
      <MUILink
        href={to ? to : "#" + itemTextInSnakeCase}
        underline="hover"
        color="inherit"
        component={Link}
      >
        <ListItemText primary={children} />
      </MUILink>
    </ListItem>
  );
};

export default InternalPageMenuItem;
