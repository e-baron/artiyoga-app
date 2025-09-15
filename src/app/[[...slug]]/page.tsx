import { allPages } from "contentlayer/generated";
import { Box, Grid } from "@mui/material";
import MdxContent from "@/components/MdxContent/MdxContent";
import siteMetaData from "@/config/siteConfig";
import Content from "@/components/Content/Content";
import Section from "@/components/Section/Section";
import Image from "@/components/Image/Image";

const generateStaticParams = async () => {
  const allParams = allPages.map((page) => ({
    slug: page._raw.flattenedPath.split("/"),
  }));
  allParams.push({ slug: [] });
  return allParams;
};

interface generatedMetadataProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const generateMetadata = async ({ params }: generatedMetadataProps) => {
  const resolvedParams = await params;

  const slug =
    !resolvedParams || !resolvedParams.slug
      ? ""
      : resolvedParams.slug.join("/");

  const page =
    allPages.find((page) => page._raw.flattenedPath === slug) ||
    allPages.find((page) => page._raw.flattenedPath === "");

  if (!page) {
    return { title: "Not found", description: "Page not found" };
  }
  return {
    title: page!.title ?? siteMetaData.title,
    description: page!.description ?? siteMetaData.description,
    url: `${siteMetaData.url}/${slug}`,
    openGraph: {
      title: page!.title ?? siteMetaData.title,
      description: page!.description ?? siteMetaData.description,
      url: `${siteMetaData.url}/${slug}`,
      siteName: siteMetaData.title,
      images: [
        {
          url: `${siteMetaData.url}${
            page?.featuredImage ? page.featuredImage : siteMetaData.defaultImage
          }`,
          width: 800,
          height: 600,
        },
      ],
      locale: "nl_BE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page!.title ?? siteMetaData.title,
      description: page!.description ?? siteMetaData.description,
      images: [
        `${siteMetaData.url}${
          page?.featuredImage ? page.featuredImage : siteMetaData.defaultImage
        }`,
      ],
    },
    metadataBase: new URL(siteMetaData.url),
  };
};

interface MdxPageLayoutProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * If autoMargin is not given or is true, we add a padding of 1rem around the content.
 * By default, autoMargin is true.
 * If autoCropPageContentWidth is not given or is true, the content width is cropped to 800px max.
 * By default, autoCropPageContentWidth is true.
 * @param param0
 * @returns
 */

const MdxPageLayout = async ({ params }: MdxPageLayoutProps) => {
  const resolvedParams = await params;

  const slug =
    !resolvedParams || !resolvedParams.slug
      ? "" // this is the index page
      : resolvedParams.slug.join("/");

  const page = allPages.find((page) => page._raw.flattenedPath === slug);

  const autoMargin = page?.autoMargin ?? true;
  const autoCropPageContentWidth = page?.autoCropPage ?? true;

  return (
    <Grid container>
      {/* Left column */}
      {autoCropPageContentWidth && (
        <Grid
          sx={{
            // Default width for small and large screens
            "@media (min-aspect-ratio: 1.5)": {
              width: "15%", // Set width to 15% when aspect ratio is <= 1.5
            },
            "@media (max-aspect-ratio: 1.5)": {
              width: "100%", // Set width to 100% when aspect ratio is > 1.5
            },
          }}
        />
      )}

      {/* Middle column */}
      <Grid
        sx={{
          display: "flex",
          justifyContent: "center",

          "@media (min-aspect-ratio: 1.5)": {
            width: "70%", // Adjust width for aspect ratio <= 1.5
          },
          "@media (max-aspect-ratio: 1.5)": {
            width: "100%", // Adjust width for aspect ratio > 1.5
          },
        }}
      >
        <Box
          className="mdx-page-layout"
          sx={{
            padding: autoMargin ? "1rem" : 0,
            margin: 0,
            width: "100%",
          }}
        >
          {page?.autoFeatureImageAndText && (
            <Section autoMargin={false}>
              <Content height="50vh" fullwidth>
                <Image
                  src={page?.featuredImage ?? siteMetaData?.defaultImage ?? ""}
                  noContainer
                  alt={page?.title ?? "Featured image"}
                />
              </Content>

              <Content fullwidth>
                <h3>{page?.title}</h3>
              </Content>
            </Section>
          )}

          <MdxContent code={page!.body.code} />
        </Box>
      </Grid>

      {/* Right column */}
      {autoCropPageContentWidth && (
        <Grid
          sx={{
            "@media (min-aspect-ratio: 1.5)": {
              width: "15%", // Set width to 15% when aspect ratio is <= 1.5
            },
            "@media (max-aspect-ratio: 1.5)": {
              width: "100%", // Set width to 100% when aspect ratio is > 1.5
            },
          }}
        />
      )}
    </Grid>
  );
};

export { generateMetadata, generateStaticParams };

export default MdxPageLayout;
