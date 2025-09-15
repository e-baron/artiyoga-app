import { withContentlayer } from "next-contentlayer2";
export default withContentlayer({
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
});
