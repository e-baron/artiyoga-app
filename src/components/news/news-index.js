import { allMDXPages } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import Link from "next/link";
import Image from "../image.js";
import { format, parseISO } from "date-fns";

/**
 * Provides an excerpt of 100 chars (see pruneLenght in graphql query)
 * @returns 
 */
const NewsIndex = () => {
  const news = allMDXPages.filter(
    (mdxPage) => mdxPage._raw?.sourceFilePath.includes("news/")
  );

  if(!news || news.length === 0 ) return null;

  return (
    <div className="index">
      {news.map((newsItem,index) => (
        <div className="index__card" key={index}>          
          {/* <div className="card card--with-light-color"> */}
            <div className="index__card__content vh-40">
              <Link href={newsItem._raw.flattenedPath}   >
                <Image src={newsItem.featuredImage}/>
              </Link>
            </div>
            <div className="index__card__header">{newsItem.title}</div>
           
            <div className="index__card__content index__card__content--is-one-column">{excerpt(newsItem.body.raw)}</div>
            <div className="index__card__content index__card__content--is-one-column">
              {format(newsItem.date, "dd/MM/yyyy")}
            </div>
          </div>
        /* </div> */
      ))}
    </div>
  );
};

function excerpt(text, length=100) {
  if(!text) return "";
  if(text.length < length) return text;
  return text.substring(0,length) + "...";
}

export default NewsIndex;