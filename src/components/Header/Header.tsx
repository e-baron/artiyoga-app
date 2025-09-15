import { SiteMetaData } from "@/types";
import Navbar from "@/components/Navbar/Navbar";

interface HeaderProps {
  siteMetaData: SiteMetaData;
}

const Header = ({ siteMetaData }: HeaderProps) => {
  return (
    <header>
      <Navbar siteMetaData={siteMetaData} />
    </header>
  );
};

export default Header;
