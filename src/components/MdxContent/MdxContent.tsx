import { getMDXComponent } from "next-contentlayer2/hooks";
import PathViewer from "@/components/PathViewer/PathViewer";
import PathViewerItem from "@/components/PathViewer/PathViewerItem";
import InternalPageMenu from "@/components/InternalPageMenu/InternalPageMenu";
import InternalPageMenuItem from "@/components/InternalPageMenu/InternalPageMenuItem";
import InternalPageTitle from "@/components/InternalPageTitle/InternalPageTitle";
import LinkFile from "@/components/LinkFile/LinkFile";
import PlantUML from "@/components/PlantUML/PlantUML";
import Image from "@/components/Image/Image";
import Carousel from "@/components/Carousel/Carousel";
import Content from "@/components/Content/Content";
import ContentWithBackground from "@/components/Content/ContentWithBackground";
import NewsIndex from "@/components/NewsIndex/NewIndex";
import Section from "@/components/Section/Section";
import * as Symbols from "@/components/Symbols/Symbols";
import SectionFooter from "@/components/Section/SectionFooter";
import Schedule from "@/components/Schedule/Schedule";
import TableWrapper from "@/components/MdxContent/TableWrapper";

const shortcodes = {
  Image,
  PlantUML,
  PathViewer,
  PathViewerItem,
  InternalPageMenu,
  InternalPageMenuItem,
  InternalPageTitle,
  LinkFile,
  Carousel,
  Content,
  ContentWithBackground,
  NewsIndex,
  Section,
  SectionFooter,
  Schedule,
  ...Symbols,
  BellIcon: Symbols.BellSymbol,
  CalendarIcon: Symbols.CalendarSymbol,
  CheckIcon: Symbols.CheckSymbol,
  LocationIcon: Symbols.LocationOnSymbol,
  MoneyIcon: Symbols.PaySymbol,
  ToolIcon: Symbols.ToolSymbol,
  ThemeIcon: Symbols.ThemeSymbol,
  PhoneIcon: Symbols.PhoneSymbol,
  CreditCardIcon: Symbols.CreditCardSymbol,
  EmailIcon: Symbols.EmailSymbol,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <TableWrapper>
      <table {...props} />
    </TableWrapper>
  ),
};

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
