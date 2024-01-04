// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";
var MDXPage = defineDocumentType(() => ({
  name: "MDXPage",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", default: "" },
    date: { type: "date", required: false },
    author: { type: "string", required: false },
    description: { type: "string", required: false },
    autoMargin: { type: "boolean", default: true },
    navbarExtraStyles: { type: "string", required: false },
    headerImage: { type: "string", required: false },
    footerImage: { type: "string", required: false },
    featuredImage: { type: "string", required: false }
  },
  computedFields: {
    url: { type: "string", resolve: (page) => `/${page._raw.flattenedPath}` }
    // don't start with /posts/
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "mdx-pages",
  documentTypes: [MDXPage],
  mdx: {
    remarkPlugins: [remarkGfm]
  }
});
export {
  MDXPage,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-TOPDLP3E.mjs.map
