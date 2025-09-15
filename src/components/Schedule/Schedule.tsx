"use client";
import React from "react";
import { Grid, Typography, Box, useTheme } from "@mui/material";

interface ScheduleSession {
  title: string;
  time: string;
}

interface ScheduleColumn {
  header: string;
  sessions: ScheduleSession[];
}

interface ScheduleProps {
  columns: ScheduleColumn[];
}

const Schedule: React.FC<ScheduleProps> = ({ columns }) => {
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: "100%",
        "@media (min-width: 600px)": {
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`, // Columns side by side
        },
      }}
    >
      {columns.map((column, colIndex) => (
        <Grid
          key={colIndex}
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column", // Stack header and cards vertically
            gap: "0.5rem",
          }}
        >
          {/* Header */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontSize: "large",
              fontWeight: "bold",
              color: theme.palette.text.primary,
            }}
          >
            {column.header}
          </Typography>

          {/* Sessions */}
          {column.sessions.map((session, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: "0.5rem",
                padding: "0.5rem",
                color: theme.palette.secondary.contrastText,
                width: "100%", // Ensure full width on smaller screens
                boxSizing: "border-box", // Include padding in width calculation
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {session.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                }}
              >
                {session.time}
              </Typography>
            </Box>
          ))}
        </Grid>
      ))}
    </Grid>
  );
};

export default Schedule;
