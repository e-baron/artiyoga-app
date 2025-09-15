import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import remarkGfm from "remark-gfm";
import rehypePrism from 'rehype-prism-plus'

const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `**/*.mdx`,
  fields: {
    title: { type: "string", required: false },
    description: { type: "string", required: false },
    date: { type: "string", required: false },
    author: { type: 'string', required: false },
    autoMargin: { type: 'boolean', default: true },
    navbarExtraStyles: { type: 'string', required: false },
    footerExtraStyles: { type: 'string', required: false },
    headerImage: { type: 'string', required: false },
    footerImage: { type: 'string', required: false },
    featuredImage: { type: 'string', required: false },
    autoCropPage: { type: 'boolean', default: true },
    category: { type: 'string', default: "none" },
  },
  contentType: "mdx",
}));

export default makeSource({
  contentDirPath: "src/mdxPages",
  documentTypes: [Page],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});
