import path from "path";
import fs from "fs";
import { get } from "lodash";
import { getAbsoluteProjectDirPath } from "./files";

function copyDir(src: string, dst: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e);
    const d = path.join(dst, e);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const root = getAbsoluteProjectDirPath();
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error(
    "[prepare-standalone] server.js missing. Run next build first."
  );
  process.exit(1);
}

// Copy public -> .next/standalone/public
copyDir(path.join(root, "public"), path.join(standalone, "public"));

// Copy .next/static -> .next/standalone/.next/static
copyDir(
  path.join(root, ".next", "static"),
  path.join(standalone, ".next", "static")
);

console.log(
  "[prepare-standalone] Copied public and .next/static into standalone."
);
