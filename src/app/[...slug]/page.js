// app/[slug]/page.tsx

import Content from "src/components/content";
import Image from "src/components/image";
import Section from "src/components/section";
import Footer from "src/components/footer";
import SectionHeader from "src/components/section-header";
import "src/scss/main.scss";
// import Scroll from "src/components/scroll/scroll";
import Header from "src/components/header/header";
import Carousel from 'src/components/carousel/carousel.js';
import NewsIndex from 'src/components/news/news-index.js';
import { format, parseISO } from "date-fns";
import { allMDXPages } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

import Link from "next/link";
// import MainLayout from '../components/main-layout.js';
import Background from "src/components/background.js";
import SectionFooter from "src/components/section-footer.js";
import PageHeader from "src/components/page-header.js";
// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */


const siteURL = "https://e-baron.github.io/artiyoga"; // No trailing slash allowed!
const siteTitle = "artiYoga";
const youtubeUrl = "https://www.youtube.com/channel/UCl_6cWf7A0yPr2GPW4uJ7lw"; //"https://www.youtube.com/channel/UC_iU0pfrDaYFXd6X9mPlAJQ";
const authorEmail = "baroni.kati@gmail.com";
const facebookUrl = "https://www.facebook.com/artiyoga";
const instagramUrl = "https://www.instagram.com/baroni.kati/";
const defaultLanguage = "nl";
const defaultAssociatedProjectGroupName = ""; // 'Web2 2023';
const projectDocument = ""; //'WEB2-2022-PROJET-GROUP-XY.docx';

const siteMetadata = {
  version: "1.0.0",
  title: siteTitle,
  description: "artiYoga : Yoga in 1500 Halle with Kati Baroni",
  url: siteURL,
  siteUrl: siteURL, // config for gatsby-plugin-robots-txt
  youtubeUrl: youtubeUrl,
  authorEmail: authorEmail,
  facebookUrl: facebookUrl,
  instagramUrl: instagramUrl,
  languages: { langs: ["nl"], defaultLangKey: defaultLanguage },
  defaultAssociatedProjectGroupName: defaultAssociatedProjectGroupName,
  isAuthentication: true,
  menuLinks: [
    {
      name: `Home`,
      link: `/`,
    },
    {
      name: "Lessen",
      link: "",
      subMenu: [
        { name: "Groeplessen", link: "/lessons/groups" },
        { name: "Bedrijfslessen", link: "/lessons/companies" },
        { name: "Privé Yoga", link: "/lessons/personal" },
        { name: "Online Yoga", link: "/lessons/online" },
        { name: "Video Yogaopnames", link: "/lessons/video" },
      ],
    },
    {
      name: `About`,
      link: ``,
      subMenu: [
        {
          name: `Kati`,
          link: `/about/kati`,
        },
        {
          name: `Yogastijlen`,
          link: `/about/yogastyles`,
        },
      ],
    },
    {
      name: `News`,
      link: `/news`,
    },
    {
      name: `Contact`,
      link: `/contact`,
    },
  ],
};


/* import { withFrontmatter } from './src/components/hoc/hoc.js';
// import CodeBlock from './src/components/codeblock/codeblock.js';
import LinkFile from './src/components/file/link-file.js';
import ScrollableImage from './src/components/image/scrollable-image';
import PublicProjectsView from './src/components/public-projects/public-projects-view';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from '@azure/msal-react';
import AuthenticatedBlock from './src/components/auth/authenticated-block.js';
import UnAuthenticatedBlock from './src/components/auth/unauthenticated-block.js';
import NestedMdxBlock from './src/components/mdx/nested-mdx-block.js';
import YoutubeImage from './src/components/image/youtube-image.js';
import InternalPageMenu from './src/components/internal-page-menu/internal-page-menu.js';
import InternalPageMenuItem from './src/components/internal-page-menu/internal-page-menu-item.js';
import InternalPageTitle from './src/components/internal-page-menu/menu-title.js';
import {
  PathViewer,
  PathViewerItem,
} from './src/components/path-viewer/path-viewer.js';
 */

const shortcodes = {
  Link,
  Image,
  Section,
  Content,
  Carousel,
  ContentWithBackground: Background,
  Background,
  SectionHeader,
  SectionFooter,
  PageHeader,
  NewsIndex,
  /* CodeBlock,
  LinkFile,
  ScrollableImage,
  PublicProjectsView,
  AuthenticatedBlock,
  UnAuthenticatedBlock,
  NestedMdxBlock,
  YoutubeImage,
  InternalPageMenu,
  InternalPageMenuItem,
  InternalPageTitle,
  PathViewer,
  PathViewerItem,*/
};

// Return a list of `params` to populate the [slug] dynamic segment
export const generateStaticParams = async () =>
  allMDXPages.map((page) => ({ slug: page._raw.flattenedPath.split("/") }));

// generateMetadata function accepts the following parameters:
// params - An object containing the dynamic route parameters object from the root segment down to the segment generateMetadata is called from. Examples:
// SEO metadata for the page
export const generateMetadata = ({ params }) => {
  const page = allMDXPages.find(
    (mdxPage) => mdxPage._raw.flattenedPath === params.slug.join("/")
  );

  if (!page) throw new Error(`Post not found for slug: ${params.slug}`);
  return {
    title: {
      absolute: page.title,
      default: siteMetadata.title,
    },
    description: page.description ?? siteMetadata.description,
    icons: {
      icon: "/images/om.svg",
    },
    creator: "e-baron",
    applicationName: siteMetadata.title,
    openGraph: {
      url: `${siteMetadata.url}/${page._raw.flattenedPath}`,
      title: page.title ?? siteMetadata.title,
      description: page.description ?? siteMetadata.description,
      siteName: siteMetadata.title,
      type: "website",
    },
  };
};

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function MDXPage({ params }) {
  const page = allMDXPages.find(
    (mdxPage) => mdxPage._raw.flattenedPath === params.slug.join("/")
  );
  if (!page) throw new Error(`Post not found for slug: ${params.slug}`);

  // Parse the MDX file via the useMDXComponent hook.
  const MDXContent = useMDXComponent(page.body.code);

  return (
    <div className="master">
      {/*  <SEO
         title={pageTitle}
         {...(frontmatter ? { description: frontmatter?.description } : {})}
         language="fr"
       /> */}

      <Header
        siteMetadata={siteMetadata}
        {...(page.navbarExtraStyles
          ? { navbarExtraStyles: page.navbarExtraStyles }
          : {})}
        {...(page.headerImage ? { headerImage: page.headerImage } : {})}
      />

      <main className="main">
        <div className={page?.autoMargin ? "page page--auto-margin " : "page"}>
          {page.featuredImage && (
            <div>
              <Section
                className={
                  !page.autoMargin ? "pt-3" : "section--auto-margin pt-3"
                }
              >
                <SectionHeader className="section__header--left">
                  {page.title}
                </SectionHeader>
                <Content className="vh-50">
                  <Image src={page.featuredImage} />{" "}
                </Content>
              </Section>
            </div>
          )}
          <MDXContent components={shortcodes} />
        </div>
      </main>

      <Footer
        siteMetaData={siteMetadata}
        frontmatter={page}
        //  langs={langsMenu}
      ></Footer>
      {/* <Scroll showBelow={250} /> */}
    </div>
  );
};




/*
import {
  MDXPageLayout,
  generateMetadata as generateMetadataOrigin,
} from "mdx-components";

export async function generateMetadata({ params }) {
  return generateMetadataOrigin({ params });
}

export default function MDXPage({ params }) {
  return <MDXPageLayout params={params} />;
}
*/