import { allPages } from "contentlayer/generated";
import ReactMarkdown from "react-markdown"; // Import react-markdown

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

interface NewsIndexProps {
  daysToConsiderNewsOutdated?: number;
}

const NewsIndex = ({ daysToConsiderNewsOutdated = -1 }: NewsIndexProps) => {
  let news = allPages.filter((mdxPage) =>
    mdxPage._raw?.sourceFilePath.includes("news/")
  );

  // Sort news by date
  news.sort((a, b) => {
    if (!b.date) return -1;
    if (!a.date) return 1;
    return parseISO(b.date).getTime() - parseISO(a.date).getTime();
  });

  // Filter news by date if daysToConsiderNewsOutdated is not set to -1
  if (daysToConsiderNewsOutdated !== -1) {
    const now = new Date();
    news = news.filter((newsItem) => {
      const diffDays = newsItem.date
        ? daysBetween(parseISO(newsItem.date), now)
        : 0;
      return (
        (newsItem.category === "events" && diffDays <= 0) ||
        (newsItem.category !== "events" &&
          diffDays <= daysToConsiderNewsOutdated)
      );
    });
  }

  if (!news || news.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ display: "flex", alignItems: "stretch" }}>
      {news.map((newsItem, index) => (
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
              href={newsItem._raw.flattenedPath}
              sx={{ height: 200 }}
            >
              <Box
                component="img"
                src={newsItem.featuredImage}
                alt={newsItem.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" align="center" gutterBottom>
                {newsItem.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {excerpt(newsItem.body.raw, 100).replace(/\*\*/g, "") }
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {newsItem.date
                  ? format(parseISO(newsItem.date), "dd/MM/yyyy")
                  : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

function excerpt(text: string, length = 100): string {
  if (!text) return "";
  if (text.length < length) return text;
  return text.substring(0, length) + "...";
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

export default NewsIndex;
