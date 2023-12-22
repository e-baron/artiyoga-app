import {
  MDXPageLayout,
  generateMetadata,
} from "mdx-components";

export const metadata = generateMetadata({params:{ slug: ["home"] }});

export default function IndexPage() {
  return <MDXPageLayout params={{ slug: ["home"] }} />;
}
