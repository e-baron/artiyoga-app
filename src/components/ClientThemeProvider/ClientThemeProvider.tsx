"use client";

import { createTheme, useTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

const color1 = "#228b22";
const color2 =  "#0089fe";

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: color1,
        },
        secondary: {
          main: color2,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: color2,
        },
        secondary: {
          main: color1,
        },
      },
    },
  },
});

/*const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#12d028ff",
        },
        secondary: {
          main: "#8414b8ff",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#8414b8ff",
        },
        secondary: {
          main: "#12d028ff",
        },
      },
    },
  },
});*/

interface ClientThemeProviderProps {
  children: React.ReactNode;
}

const ClientThemeProvider = ({ children }: ClientThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DynamicGlobalStyles />
      {children}
    </ThemeProvider>
  );
};

const DynamicGlobalStyles = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        blockquote: {
          borderLeft: `5px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.action.hover,
          padding: "0.5em",
          margin: "1em 0",
        },
        table: {
          width: "100%",
          borderCollapse: "collapse",         
        },
        th: {
          border: `1px solid ${theme.palette.divider}`,
          padding: "8px",
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: "bold",          
        },
        
        td: {
          border: `1px solid ${theme.palette.divider}`,
          padding: "8px",
          
        },
        "tr:nth-of-type(even)": {
          backgroundColor: theme.palette.action.hover,
        },
        "tr:hover": {
          backgroundColor: theme.palette.action.selected,
        },
        ul: {
          listStyleType: '"🌿"',
        },
        li: {
          paddingLeft: "0.5rem",
        },
        a: {
          color: theme.palette.primary.main,          
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            color: theme.palette.primary.dark,       
            textDecoration: 'underline',
          },
          '&:active': {
            color: theme.palette.primary.light,      
          },
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.light}`,
            outlineOffset: '2px',
          },
        },
      }}
    />
  );
};

export { theme, ClientThemeProvider };
