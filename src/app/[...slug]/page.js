// app/[slug]/page.tsx
import {
  MDXPageLayout,
  generateMetadata,
  generateStaticParams,
} from "mdx-components";


export default function Page({ params }) {
  return <MDXPageLayout params={{ slug: params.slug}} />;
}

export {generateMetadata, generateStaticParams};

