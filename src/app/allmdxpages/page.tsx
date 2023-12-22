// app/page.tsx
import Link from "next/link";
import { compareDesc, format, parseISO } from "date-fns";
import { allMDXPages, MDXPage } from "contentlayer/generated";

function PostCard(page: MDXPage) {
  // const MDXComponent = useMDXComponent(post.body.code);
  console.log("POST:", page);
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={page.url}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {page.title}
        </Link>
      </h2>
      <time dateTime={page.date} className="mb-2 block text-xs text-gray-600">
        {page.date ? format(parseISO(page.date), "LLLL d, yyyy") : ""}
      </time>
      <div>
      </div>
    </div>
  );
}

export default function Home() {
  const pages = allMDXPages.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-8 text-center text-2xl font-black">
        Next.js + Contentlayer Example
      </h1>
      {pages.map((page, idx) => (
        <PostCard key={idx} {...page} />
      ))}
    </div>
  );
}
