"use client";

import { Facebook, Instagram, YouTube } from "@mui/icons-material";

import { SiteMetaData } from "@/types";
import { Box, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { EmailSymbol } from "@/components/Symbols/Symbols";

interface FooterProps {
  siteMetaData: SiteMetaData;
}

const Footer = ({ siteMetaData }: FooterProps) => {
  const theme = useTheme();
  return (
    <Box component="footer">
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: "flex",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Grid size={{ xs: 12, md: 4 }} textAlign="center">
          <Typography variant="body2">
            © {new Date().getFullYear()} - {siteMetaData.title}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "center" },
              alignItems: "center",
              gap: "8px",
            }}
          >
            {siteMetaData.authorEmail && (
              <IconButton
                href={`mailto:${siteMetaData.authorEmail}`}
                sx={{ color: theme.palette.primary.contrastText }}
                aria-label="Envoyer un email"
              >
                <EmailSymbol />
              </IconButton>
            )}
            {siteMetaData.facebookUrl && (
              <IconButton
                href={siteMetaData.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: theme.palette.primary.contrastText }}
                aria-label="Facebook"
              >
                <Facebook />
              </IconButton>
            )}
            {siteMetaData.instagramUrl && (
              <IconButton
                href={siteMetaData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: theme.palette.primary.contrastText }}
                aria-label="Instagram"
              >
                <Instagram />
              </IconButton>
            )}
            {siteMetaData.youtubeUrl && (
              <IconButton
                href={siteMetaData.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: theme.palette.primary.contrastText }}
                aria-label="YouTube"
              >
                <YouTube />
              </IconButton>
            )}
          </Box>
        </Grid>

        {siteMetaData.extraBackgroundText && (
          <Grid size={{ xs: 12, md: 4 }} textAlign="center">
            <Typography variant="body2">
              {siteMetaData.extraBackgroundText}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Footer;
