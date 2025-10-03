import { MdxPage } from "@/types";
import { getAllRuntimePages } from "@/utils/runtime-pages";

let cachedPages: MdxPage[] | null = null;
let cachedContents: MdxPage[] | null = null;

const getAllPages = async () => {
  if (!cachedPages) {
    cachedPages = await getAllRuntimePages();
  }
  return cachedPages;
};

const getAllContents = async () => {
  if (!cachedContents) {
    const pages = await getAllPages();
    cachedContents = pages.filter((page) =>
      page._raw?.flattenedPath?.startsWith("contents/")
    );
  }
  return cachedContents;
};

export { getAllPages, getAllContents };
