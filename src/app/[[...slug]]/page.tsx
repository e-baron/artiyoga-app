import { Box, Grid } from "@mui/material";
import siteMetaData from "@/config/site-config.json";
import Content from "@/components/Content/Content";
import Section from "@/components/Section/Section";
import Image from "@/components/Image/Image";
import EditPage from "@/components/EditPage/EditPage";
import { readRuntimePage, getAllRuntimePages } from "@/utils/runtime-pages";

// export const dynamic = "force-dynamic";

/*export async function generateStaticParams() {
  return [];
}*/

export async function generateStaticParams() {
  const allPages = await getAllRuntimePages();
  const allParams = allPages.map((page) => ({
    slug: page._raw.flattenedPath.split("/"),
  }));
  allParams.push({ slug: [] });
  return allParams;
}

interface generatedMetadataProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: generatedMetadataProps) {
  const resolved = await params;
  const slug = !resolved?.slug ? "" : resolved.slug.join("/");
  let page;
  try {
    page = readRuntimePage(slug || "index");
  } catch {
    try {
      page = readRuntimePage("index");
    } catch {
      return { title: "Not found", description: "Page not found" };
    }
  }
  return {
    title: page.title || siteMetaData.title,
    description: page.description || siteMetaData.description,
    url: `${siteMetaData.url}/${slug}`,
    openGraph: {
      title: page.title || siteMetaData.title,
      description: page.description || siteMetaData.description,
      url: `${siteMetaData.url}/${slug}`,
      siteName: siteMetaData.title,
      images: [
        {
          url: `${siteMetaData.url}${
            page.featuredImage ? page.featuredImage : siteMetaData.defaultImage
          }`,
          width: 800,
          height: 600,
          alt: page.title || siteMetaData.title,
        },
      ],
      locale: "nl_BE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title || siteMetaData.title,
      description: page.description || siteMetaData.description,
      images: [
        `${siteMetaData.url}${
          page.featuredImage ? page.featuredImage : siteMetaData.defaultImage
        }`,
      ],
    },
    metadataBase: new URL(siteMetaData.url),
  };
}

interface MdxPageLayoutProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MdxPageLayout({ params }: MdxPageLayoutProps) {
  const resolved = await params;
  const slug = !resolved?.slug ? "" : resolved.slug.join("/");
  let page;
  try {
    page = readRuntimePage(slug || "index");
  } catch {
    return (
      <div style={{ padding: "2rem" }}>
        Page not found: {slug || "(index)"}.
      </div>
    );
  }

  const autoMargin = page.autoMargin ?? true;

  return (
    <Grid container>
      <Grid sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box
          className="mdx-page-layout"
          sx={{ padding: autoMargin ? "1rem" : 0, margin: 0, width: "100%" }}
        >
          {page.autoFeatureImageAndText && (
            <Section autoMargin={false}>
              <Content height="50vh" fullwidth>
                <Image
                  src={page.featuredImage ?? siteMetaData?.defaultImage ?? ""}
                  noContainer
                  alt={page.title ?? "Featured image"}
                />
              </Content>
              <Content fullwidth>
                <h3>{page.title}</h3>
              </Content>
            </Section>
          )}
          <EditPage page={page} />
        </Box>
      </Grid>
    </Grid>
  );
}
