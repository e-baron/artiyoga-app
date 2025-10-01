import { app, BrowserWindow } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

let win: BrowserWindow | null = null;
let server: ChildProcess | null = null;

const PORT = process.env.PORT || "3001";
const TIMEOUT = 60000;
const RETRY = 600;
const FORCE_DEV = process.env.FORCE_DEV === "1";

function rootDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app")
    : path.join(__dirname, "..", "..");
}

function entry() {
  return path.join(rootDir(), ".next", "standalone", "server.js");
}

function startServer() {
  if (server) return;
  const e = entry();
  if (!fs.existsSync(e)) {
    console.error("[Electron] Missing standalone server:", e);
    return;
  }
  console.log("[Electron] Starting standalone Next:", e, "PORT", PORT);
  server = spawn(process.execPath, [e], {
    cwd: rootDir(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      FORCE_DEV: "1", // keeps basePath cleared if built that way
      PORT: PORT,
    },
    stdio: "inherit",
  });
  server.on("exit", (c) => {
    console.log("[Electron] Next server exited:", c);
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

async function createWindow() {
  startServer();
  const basePath = FORCE_DEV ? "" : process.env.NEXT_BASE_PATH || "";
  const url = `http://localhost:${PORT}${basePath}`;
  try {
    await waitFor(url);
  } catch {
    console.warn("[Electron] Server not confirmed ready");
  }

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
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
