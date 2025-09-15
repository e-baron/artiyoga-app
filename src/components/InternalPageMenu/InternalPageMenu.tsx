"use client";
import React, { useState } from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { List } from "@mui/material";

interface InternalPageMenuProps {
  children: React.ReactNode;
  id: number;
}

const style = {
  width: "100%",
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  padding: "0.5rem",
};

const InternalPageMenu = ({ children }: InternalPageMenuProps) => {
  const [menuIsHidden, setMenuIsHidden] = useState(false);

  const onCloseOpenBtnClick = () => {
    setMenuIsHidden(!menuIsHidden);
  };

  if (menuIsHidden)
    return (
      <List sx={style}>
        <MenuOpenIcon onClick={onCloseOpenBtnClick} />
      </List>
    );

  return (
    <List sx={style}>
      <HighlightOffIcon onClick={onCloseOpenBtnClick} />
      {children}
    </List>
  );
};

export default InternalPageMenu;
