import { app, BrowserWindow } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

let win: BrowserWindow | null = null;
let nextProc: ChildProcess | null = null;
let spawning = false;

const PORT = String(process.env.PORT || 3001);
const WAIT_MS = 60000;
const RETRY = 700;

function projectRoot(): string {
  if (app.isPackaged) {
    return app.getAppPath();
  }
  return path.resolve(__dirname, "..", "..");
}

function nextCliPath(root: string) {
  return path.join(root, "node_modules", "next", "dist", "bin", "next");
}

function hasProdBuild(root: string) {
  return fs.existsSync(path.join(root, ".next", "BUILD_ID"));
}

function mode(root: string): "dev" | "prod" {
  if (app.isPackaged) return "prod";
  if (process.env.USE_PROD === "1") return "prod";
  return hasProdBuild(root) ? "prod" : "dev";
}

async function fallbackProgrammatic(root: string) {
  try {
    console.log("[Electron] Fallback: starting Next programmatically");
    const nextModule = await import(path.join(root, "node_modules", "next"));
    const next = nextModule.default || nextModule;
    const nextApp = next({ dev: false, dir: root, port: Number(PORT) });
    await nextApp.prepare();
    const handler = nextApp.getRequestHandler();
    const httpModule = await import("node:http");
    httpModule
      .createServer((req, res) => handler(req, res))
      .listen(PORT, () =>
        console.log("[Electron] Programmatic Next listening on", PORT)
      );
  } catch (e) {
    console.error("[Electron] Programmatic fallback failed:", e);
  }
}

function spawnNext() {
  if (nextProc || spawning) return;
  spawning = true;

  const root = projectRoot();
  const cli = nextCliPath(root);

  console.log("[Electron] packaged =", app.isPackaged);
  console.log("[Electron] projectRoot =", root);
  console.log("[Electron] in asar =", root.includes(".asar"));
  console.log("[Electron] next CLI exists =", fs.existsSync(cli));
  console.log("[Electron] .next BUILD_ID =", hasProdBuild(root));
  console.log(
    "[Electron] public exists =",
    fs.existsSync(path.join(root, "public"))
  );
  console.log(
    "[Electron] .contentlayer exists =",
    fs.existsSync(path.join(root, ".contentlayer"))
  );

  if (!fs.existsSync(cli)) {
    console.error("[Electron] next CLI missing; using fallback.");
    spawning = false;
    void fallbackProgrammatic(root);
    return;
  }

  const m = mode(root);
  const args = m === "prod" ? ["start", "-p", PORT] : ["dev", "-p", PORT];
  console.log(`[Electron] Spawning Next (${m})`, args.join(" "));

  nextProc = spawn(process.execPath, [cli, ...args], {
    cwd: root,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: m === "prod" ? "production" : "development",
      PORT,
    },
    stdio: "inherit",
  });

  nextProc.on("exit", (c, s) => {
    console.log("[Electron] Next exited", c, s || "");
    nextProc = null;
  });
  nextProc.on("error", (e) => {
    console.error("[Electron] Next spawn error", e);
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

async function createWindow() {
  spawnNext();
  const url = `http://localhost:${PORT}`;
  try {
    await waitFor(url);
  } catch {
    console.warn("[Electron] Next not confirmed ready:", url);
  }

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  console.log("[Electron] Loading URL:", url);
  try {
    await win.loadURL(url);
  } catch (e) {
    console.error("[Electron] loadURL failed:", (e as Error).message);
    win.loadURL("data:text/plain,Failed to load Next server (see console).");
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
