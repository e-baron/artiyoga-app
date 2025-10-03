"use client";

import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { format, parseISO, isValid } from "date-fns";
import { MdxPage } from "@/types";
import { useEffect, useState } from "react";
import { isDev } from "@/utils/env";

interface ContentIndexProps {
  daysToConsiderNewsOutdated?: number;
  requestedCategoriesOnly?: string[];
  contentPagePath?: string;
  suppressPotentialMarkdownCodeInExcerpt?: boolean;
}

/**
 * ContentIndex client component displays a list of content-related articles.
 * @param props - Props for the ContentIndex component.
 * @returns The rendered ContentIndex component.
 */
const ContentIndex = ({
  daysToConsiderNewsOutdated = -1,
  requestedCategoriesOnly = [],
  contentPagePath = "contents/",
  suppressPotentialMarkdownCodeInExcerpt = true,
}: ContentIndexProps) => {
  const [allPages, setAllPages] = useState<MdxPage[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []); // Remove the condition, always fetch on mount

  const fetchPages = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isDev()) {
        // Production: fetch from static JSON file
        console.log("Fetching from static JSON file...");
        const response = await fetch("/data/pages.json");

        if (!response.ok) {
          throw new Error(`Failed to fetch static data: ${response.status}`);
        }

        const pages = await response.json();
        setAllPages(pages);
      } else {
        // Development: fetch from API
        console.log("Fetching from API...");
        const response = await fetch("/api/pages");

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        setAllPages(data.pages || data); // Handle both response formats
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load content."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading content...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  if (allPages.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        No content available.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ display: "flex", alignItems: "stretch" }}>
      {allPages
        .filter(
          (page) => page._raw?.flattenedPath?.startsWith(contentPagePath) // Add safe navigation
        )
        .sort((a, b) => {
          const dateA = safeParseDate(a.date);
          const dateB = safeParseDate(b.date);

          // Handle null dates (put them at the end)
          if (!dateB && !dateA) return 0;
          if (!dateB) return -1;
          if (!dateA) return 1;

          return dateB.getTime() - dateA.getTime();
        })
        .filter((contentItem) => {
          if (daysToConsiderNewsOutdated === -1) {
            // No date filtering, just check published status and category
            return (
              contentItem.published &&
              (requestedCategoriesOnly.length === 0 ||
                requestedCategoriesOnly.includes(
                  contentItem.category || "none"
                ))
            );
          }

          const now = new Date();
          const parsedDate = safeParseDate(contentItem.date);
          const diffDays = parsedDate ? daysBetween(parsedDate, now) : 0;
          const isPublished = contentItem.published;
          const isInCategory =
            requestedCategoriesOnly.length === 0 ||
            requestedCategoriesOnly.includes(contentItem.category || "none");
          const isWithinDateRange =
            diffDays <= 0 || diffDays <= daysToConsiderNewsOutdated;

          return isPublished && isInCategory && isWithinDateRange;
        })
        .map((contentItem, index) => (
          <Grid
            size={{ xs: 12, sm: 6, xl: 4 }}
            key={`${contentItem._raw?.flattenedPath}-${index}`} // Add safe navigation
            sx={{ display: "flex" }}
          >
            <Card
              sx={{
                borderRadius: "0.5rem",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <CardMedia
                component={Link}
                href={contentItem._raw?.flattenedPath || "#"} // Add fallback
                sx={{ height: 200 }}
              >
                <Box
                  component="img"
                  src={contentItem.featuredImage || "/placeholder-image.jpg"} // Add fallback
                  alt={contentItem.title || "Content image"}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  {contentItem.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {excerpt(
                    contentItem.body?.raw || "",
                    100,
                    suppressPotentialMarkdownCodeInExcerpt
                  )}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(() => {
                    const parsedDate = safeParseDate(contentItem.date);
                    return parsedDate ? format(parsedDate, "dd/MM/yyyy") : "";
                  })()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
};

// ... (keep all your helper functions as they are)

/**
 * Helper function to safely parse a date
 */
function safeParseDate(
  dateValue: string | number | Date | null | undefined
): Date | null {
  if (!dateValue) return null;

  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null;
  }

  // If it's a string, try to parse it
  if (typeof dateValue === "string") {
    try {
      const parsed = parseISO(dateValue);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  // If it's a number (timestamp), convert it
  if (typeof dateValue === "number") {
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
  }

  return null;
}

function excerpt(text: string, length = 100, suppressMarkdown = false): string {
  if (!text) return "";

  // Remove markdown syntax if suppressMarkdown is true
  if (suppressMarkdown) {
    text = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold (**text**)
      .replace(/__(.*?)__/g, "$1") // Remove underline (__text__)
      .replace(/\*(.*?)\*/g, "$1") // Remove italic (*text*)
      .replace(/_(.*?)_/g, "$1") // Remove italic (_text_)
      .replace(/`(.*?)`/g, "$1") // Remove inline code (`text`)
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links ([text](url))
      .replace(/!\[(.*?)\]\(.*?\)/g, "") // Remove images (![alt](url))
      .replace(/#+\s/g, "") // Remove headings (# Heading)
      .replace(/>\s/g, "") // Remove blockquotes (> text)
      .replace(/[-*]\s/g, "") // Remove list items (- text or * text)
      .replace(/\r?\n|\r/g, " "); // Replace newlines with spaces
  }

  // Trim the text to the specified length
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }

  return text;
}

function treatAsUTC(date: Date): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
}

function daysBetween(startDate: Date, endDate: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (
    (treatAsUTC(endDate).getTime() - treatAsUTC(startDate).getTime()) /
    millisecondsPerDay
  );
}

export default ContentIndex;
