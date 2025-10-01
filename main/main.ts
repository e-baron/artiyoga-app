import { app, BrowserWindow } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

let win: BrowserWindow | null = null;
let server: ChildProcess | null = null;
let starting = false;

const PORT = process.env.PORT || "3001";
const TIMEOUT = 60000;
const RETRY = 600;
const FORCE_DEV = process.env.FORCE_DEV === "1";

function rootDir() {
  return app.getAppPath(); // resolves to Resources/app (packaged) or project root (dev)
}
function standaloneDir() {
  return path.join(rootDir(), ".next", "standalone");
}
function serverEntry() {
  return path.join(standaloneDir(), "server.js");
}

function startServer() {
  if (server || starting) return;
  starting = true;

  const entry = serverEntry();
  const pubImg = path.join(rootDir(), "public", "images", "raphael.jpg");

  console.log("[Electron] rootDir =", rootDir());
  console.log("[Electron] standaloneDir =", standaloneDir());
  console.log("[Electron] server.js exists =", fs.existsSync(entry));
  console.log("[Electron] sample public image exists =", fs.existsSync(pubImg));

  if (!fs.existsSync(entry)) {
    console.error("[Electron] Missing standalone server:", entry);
    starting = false;
    return;
  }

  server = spawn(process.execPath, [entry], {
    cwd: standaloneDir(), // IMPORTANT
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      FORCE_DEV: FORCE_DEV ? "1" : undefined,
      PORT: PORT,
    },
    stdio: "inherit",
  });

  server.on("error", (err) => {
    console.error("[Electron] Server spawn error:", err);
    starting = false;
    server = null;
  });
  server.on("exit", (code, sig) => {
    console.log("[Electron] Next server exited:", code, sig || "");
    starting = false;
    server = null;
  });
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
      if (Date.now() - start > TIMEOUT) return reject(new Error("timeout"));
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
  startServer();
  const basePath = FORCE_DEV ? "" : process.env.NEXT_BASE_PATH || "";
  const url = `http://localhost:${PORT}${basePath}`;

  try {
    await waitFor(url);
  } catch {
    console.warn("[Electron] Server not confirmed ready:", url);
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
    win.loadURL("data:text/plain,Failed to load Next server.");
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (server) {
    server.kill();
    server = null;
  }
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (!win) createWindow();
});
