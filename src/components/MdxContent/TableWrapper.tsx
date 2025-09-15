import React from "react";
import { Box } from "@mui/material";

interface TableWrapperProps {
  children: React.ReactNode;
}

const TableWrapper = ({ children }: TableWrapperProps) => {
  return (
    <Box
      className="table-wrapper"
      sx={{
        overflowX: "auto", 
        width: "100%", 
        display: "block", // Ensure it behaves like a block element
    }}
    >
      {children}
    </Box>
  );
};

export default TableWrapper;
