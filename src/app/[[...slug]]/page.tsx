import { allPages } from "contentlayer/generated";
import { Box, Grid } from "@mui/material";
import siteMetaData from "@/config/site-config.json";
import Content from "@/components/Content/Content";
import Section from "@/components/Section/Section";
import Image from "@/components/Image/Image";
import EditPage from "@/components/EditPage/EditPage";

const isLocal = process.env.NEXT_PUBLIC_NODE_ENV === "development";

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
          alt: page!.title ?? siteMetaData.title,
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

const MdxPageLayout = async ({ params }: MdxPageLayoutProps) => {
  const resolvedParams = await params;

  const slug =
    !resolvedParams || !resolvedParams.slug
      ? "" // this is the index page
      : resolvedParams.slug.join("/");

  const page = allPages.find((page) => page._raw.flattenedPath === slug);

  const autoMargin = page?.autoMargin ?? true;

  return (
    <Grid container>
      {/* Middle column */}
      <Grid
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
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

          {/* Pass the entire page object to the EditPage component */}
          <EditPage page={page!} />
        </Box>
      </Grid>
    </Grid>
  );
};

export { generateMetadata, generateStaticParams };

export default MdxPageLayout;
