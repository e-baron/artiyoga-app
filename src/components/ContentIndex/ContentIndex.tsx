import { allPages } from "contentlayer/generated";

import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { format, parseISO } from "date-fns";

interface ContextIndexProps {
  daysToConsiderNewsOutdated?: number;
  requestedCategoriesOnly?: string[];
  contentPagePath?: string;
  suppressPotentialMarkdownCodeInExcerpt?: boolean;
}

/**
 * ContextIndex component displays a list of context-related articles.
 * @param param0 - Props for the ContextIndex component.
 * @returns The rendered ContextIndex component.
 */

const ContextIndex = ({
  daysToConsiderNewsOutdated = -1,
  requestedCategoriesOnly = [],
  contentPagePath = "contents/",
  suppressPotentialMarkdownCodeInExcerpt = true,
}: ContextIndexProps) => {
  let contents = allPages.filter((mdxPage) =>
    mdxPage._raw?.sourceFilePath.includes(contentPagePath)
  );

  // Sort news by date
  contents.sort((a, b) => {
    if (!b.date) return -1;
    if (!a.date) return 1;
    return parseISO(b.date).getTime() - parseISO(a.date).getTime();
  });

  // Filter news by date if daysToConsiderNewsOutdated is not set to -1
  if (daysToConsiderNewsOutdated !== -1) {
    const now = new Date();
    contents = contents.filter((newsItem) => {
      const diffDays = newsItem.date
        ? daysBetween(parseISO(newsItem.date), now)
        : 0;
      const isPublished = newsItem.published;
      const isInCategory =
        requestedCategoriesOnly.length === 0 ||
        requestedCategoriesOnly.includes(newsItem.category);
      const isWithinDateRange =
        diffDays <= 0 || diffDays <= daysToConsiderNewsOutdated;

      return isPublished && isInCategory && isWithinDateRange;
    });
  }

  if (!contents || contents.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ display: "flex", alignItems: "stretch" }}>
      {contents.map((contentItem, index) => {
        if (
          contentItem.published &&
          (requestedCategoriesOnly.length === 0 ||
            requestedCategoriesOnly.includes(contentItem.category))
        )
          return (
            <Grid
              size={{ xs: 12, sm: 6, xl: 4 }}
              key={index}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1, // Ensures all cards stretch to the same height
                }}
              >
                <CardMedia
                  component={Link}
                  href={contentItem._raw.flattenedPath}
                  sx={{ height: 200 }}
                >
                  <Box
                    component="img"
                    src={contentItem.featuredImage}
                    alt={contentItem.title}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    {contentItem.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {excerpt(
                      contentItem.body.raw,
                      100,
                      suppressPotentialMarkdownCodeInExcerpt
                    )}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {contentItem.date
                      ? format(parseISO(contentItem.date), "dd/MM/yyyy")
                      : ""}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
      })}
    </Grid>
  );
};

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

export default ContextIndex;
