import { getMDXComponent } from "next-contentlayer2/hooks";
import shortcodes  from "@/utils/mdx";

interface MdxContentProps {
  code: string;
}

/**
 * Renders the MDX content. This component is used to render the MDX content
 * and can be called from a server-side rendered component.
 *
 * @param code The MDX code that should be rendered.
 * @returns The rendered MDX content.
 *
 */
const MdxContent = ({ code }: MdxContentProps) => {
  const Component = getMDXComponent(code);
  return <Component components={shortcodes} />;
};

export default MdxContent;
