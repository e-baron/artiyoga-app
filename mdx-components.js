import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill1Wave,
  faMapLocation,
  faCalendarCheck,
  faEnvelope,
  faPhone,
  faCreditCard,
  faList,
  faBell,
  faToolbox,
} from "@fortawesome/free-solid-svg-icons";

import Content from "src/components/content";
import Image from "src/components/image";
import Section from "src/components/section";
import Footer from "src/components/footer";
import SectionHeader from "src/components/section-header";
import SectionMiddleTitle from "src/components/section-middle-title";
import "src/scss/main.scss";
import Scroll from "src/components/scroll/scroll";
import Header from "src/components/header/header";
import Carousel from "src/components/carousel/carousel.js";
import NewsIndex from "src/components/news/news-index.js";
import { format, parseISO } from "date-fns";
import { allMDXPages } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

import Link from "next/link";
import Background from "src/components/background.js";
import SectionFooter from "src/components/section-footer.js";
import PageHeader from "src/components/page-header.js";
// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const siteURL = "https://www.artiyoga.com"; // No trailing slash allowed!
const siteTitle = "artiYoga";
const youtubeUrl = "https://www.youtube.com/channel/UCl_6cWf7A0yPr2GPW4uJ7lw"; //"https://www.youtube.com/channel/UC_iU0pfrDaYFXd6X9mPlAJQ";
const authorEmail = "baroni.kati@gmail.com";
const facebookUrl = "https://www.facebook.com/baroni.kati";
const instagramUrl = "https://www.instagram.com/baroni.kati/";
const defaultLanguage = "nl";
const defaultAssociatedProjectGroupName = ""; // 'Web2 2023';
const projectDocument = ""; //'WEB2-2022-PROJET-GROUP-XY.docx';

const siteMetadata = {
  version: "", // "2.0.0",
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
      name: "Yoga",
      link: "",
      subMenu: [
        { name: "Groepslessen", link: "/lessons/groups" },
        { name: "Yoga met de natuur", link: "/lessons/nature" },
        { name: "VrouwenYoga Cirkel", link: "/lessons/women" },
        { name: "Privé Yoga", link: "/lessons/personal" },
        { name: "Online Yoga", link: "/lessons/video" },
      ],
    },
    {
      name: `Coaching`,
      link: `/coaching`,
    },
    {
      name: `Reiki`,
      link: `/reiki`,
    },
    {
      name: `Events`,
      link: `/events`,
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
      name: `Contact`,
      link: `/contact`,
    },
  ],
};

const MoneyIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faMoneyBill1Wave} fixedWidth size={size} />
);

const LocationIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faMapLocation} fixedWidth size={size} />
);

const CalendarIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faCalendarCheck} fixedWidth size={size} />
);

const EmailIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faEnvelope} fixedWidth size={size} />
);

const PhoneIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faPhone} fixedWidth size={size} />
);

const CreditCardIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faCreditCard} fixedWidth size={size} />
);

const ListIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faList} fixedWidth size={size} />
);

const BellIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faBell} fixedWidth size={size} />
);

const ToolIcon = ({ size = "2x" }) => (
  <FontAwesomeIcon icon={faToolbox} fixedWidth size={size} />
);

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
  SectionMiddleTitle,
  PageHeader,
  NewsIndex,
  MoneyIcon,
  LocationIcon,
  CalendarIcon,
  EmailIcon,
  PhoneIcon,
  CreditCardIcon,
  ThemeIcon: ListIcon,
  BellIcon,
  ToolIcon,
};

/* The generateStaticParams function can be used in combination with dynamic route 
segments to statically generate routes at build time instead of on-demand at 
request time.
*/
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
export const MDXPageLayout = ({ params }) => {
  const page = allMDXPages.find(
    (mdxPage) => mdxPage._raw.flattenedPath === params.slug.join("/")
  );
  if (!page) throw new Error(`Post not found for slug: ${params.slug}`);

  // Parse the MDX file via the useMDXComponent hook.
  const MDXContent = useMDXComponent(page.body.code);

  return (
    <>
      {page?.autoCropPage && <div className="side-empty-column"></div>}
      <div className="master">
        {}

        <Header
          siteMetadata={siteMetadata}
          {...(page.navbarExtraStyles
            ? { navbarExtraStyles: page.navbarExtraStyles }
            : {})}
          {...(page.headerImage ? { headerImage: page.headerImage } : {})}
        />

        <main className="main">
          <div
            className={page?.autoMargin ? "page page--auto-margin " : "page"}
          >
            {page.featuredImage && (
              <div>
                <Section
                  className={
                    !page.autoMargin ? "pt-3" : "section--auto-margin pt-3"
                  }
                >
                  <Content className="vh-50 pl-0 pr-0 pt-0 pb-3">
                    <Image src={page.featuredImage} />
                  </Content>

                  <Content className="vw-100 pl-0 pr-0">
                    <h3>{page.title}</h3>
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
          {...(page.footerExtraStyles
            ? { footerExtraStyles: page.footerExtraStyles }
            : {})}
          //  langs={langsMenu}
        ></Footer>
        <Scroll showBelow={250} />
      </div>
      {page?.autoCropPage && <div className="side-empty-column"></div>}
    </>
  );
};

// this function can be used for page.mdx in the app folder

export default function useMDXComponents(components) {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    ...shortcodes,
    h1: ({ children }) => <h1 style={{ fontSize: "100px" }}>{children}</h1>,
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...props}
      />
    ),
    ...components,
  };
}
