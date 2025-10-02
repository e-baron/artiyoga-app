import { app, BrowserWindow } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

let win: BrowserWindow | null = null;
let nextProc: ChildProcess | null = null;
let spawning = false;

const PORT = process.env.PORT || "3001";
const WAIT_MS = 60000;
const RETRY = 700;

function projectRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app"); // packaged layout
  }
  // Running locally from dist-electron/main/main.js → go two levels up
  let dir = path.resolve(__dirname, "..", "..");
  // Walk up until we find package.json with node_modules
  while (true) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "node_modules"))
    )
      return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback
  return process.cwd();
}

function nextCliPath() {
  return path.join(
    projectRoot(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next"
  );
}

function hasProdBuild() {
  return fs.existsSync(path.join(projectRoot(), ".next", "BUILD_ID"));
}

function mode(): "dev" | "prod" {
  if (app.isPackaged) return "prod";
  if (process.env.USE_PROD === "1") return "prod";
  return hasProdBuild() && process.env.FORCE_DEV !== "1" ? "prod" : "dev";
}

function spawnNext() {
  if (nextProc || spawning) return;
  spawning = true;

  const root = projectRoot();
  const cli = nextCliPath();

  console.log("[Electron] projectRoot =", root);
  console.log("[Electron] next CLI path =", cli);

  if (!fs.existsSync(cli)) {
    console.error("[Electron] next CLI missing:", cli);
    spawning = false;
    return;
  }

  const m = mode();
  const args = m === "prod" ? ["start", "-p", PORT] : ["dev", "-p", PORT];
  console.log(`[Electron] Spawning Next (${m}) ->`, args.join(" "));

  nextProc = spawn(process.execPath, [cli, ...args], {
    cwd: root,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: m === "prod" ? "production" : "development",
      PORT: PORT,
    },
    stdio: "inherit",
  });

  nextProc.on("exit", (c, s) => {
    console.log("[Electron] Next exited:", c, s || "");
    nextProc = null;
  });
  nextProc.on("error", (e) => {
    console.error("[Electron] Next spawn error:", e);
    nextProc = null;
  });
  spawning = false;
}

function waitFor(url: string) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, (res) => {
          res.resume();
          if ((res.statusCode || 0) < 500) return resolve();
          retry();
        })
        .on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start > WAIT_MS) return reject(new Error("timeout"));
      setTimeout(attempt, RETRY);
    };
    attempt();
  });
}

function attachImage404Logging(w: BrowserWindow) {
  w.webContents.session.webRequest.onCompleted((d) => {
    if (d.statusCode === 404 && /\/images\//.test(d.url)) {
      console.warn("[Electron][IMG 404]", d.url);
    }
  });
}

async function createWindow() {
  spawnNext();
  const url = `http://localhost:${PORT}`;
  try {
    await waitFor(url);
  } catch {
    console.warn("[Electron] Next not confirmed ready (continuing)");
  }

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  attachImage404Logging(win);

  console.log("[Electron] Loading:", url);
  try {
    await win.loadURL(url);
  } catch (e) {
    console.error("[Electron] Load failed:", (e as Error).message);
    win.loadURL("data:text/plain,Failed to load Next application.");
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (nextProc) {
    nextProc.kill();
    nextProc = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!win) createWindow();
});
