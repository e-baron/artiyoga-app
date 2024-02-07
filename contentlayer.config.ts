import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import remarkGfm from "remark-gfm";

export const MDXPage = defineDocumentType(() => ({
  name: 'MDXPage',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', default: "" },
    date: { type: 'date', required: false },
    author: { type: 'string', required: false },
    description: { type: 'string', required: false },
    autoMargin: { type: 'boolean', default: true },
    navbarExtraStyles: { type: 'string', required: false },
    footerExtraStyles: { type: 'string', required: false },
    headerImage: { type: 'string', required: false },
    footerImage: { type: 'string', required: false },
    featuredImage: { type: 'string', required: false },
    autoCropPage: { type: 'boolean', default: true },
    category: { type: 'string', default: "none" },
  },
  computedFields: {
    url: { type: 'string', resolve: (page) => `/${page._raw.flattenedPath}` },// don't start with /posts/
  },
}))

export default makeSource({
  contentDirPath: 'mdx-pages', documentTypes: [MDXPage],
  mdx: {
    remarkPlugins: [[remarkGfm]],
    rehypePlugins: [],
  },
})

/*
const typeDefs = `
  type Mdx implements Node {
    frontmatter: MdxFrontmatter!
  }
    type MdxFrontmatter {      
      autoMargin: Boolean @defaultTrue
      title: String @defaultString   
      description: String @defaultString 
      headerImage: String @defaultString 
      footerImage: String @defaultString 
      featuredImage: String @defaultString 
      navbarExtraStyles: String @defaultString
      date: Date @dateformat(formatString: "DD/MM/YYYY")
    }
    type Site implements Node {
      siteMetadata: SiteMetadata
    }
    type SiteMetadata {
      menuLinks: [MenuLinks]!
    }
    type MenuLinks {
      name: String!
      link: String!
      protected: Boolean @defaultFalse
      subMenu: [SubMenu] @defaultArray
    }
    type SubMenu {
      name: String
      link: String
      protected: Boolean @defaultFalse
    }     
  `;
*/