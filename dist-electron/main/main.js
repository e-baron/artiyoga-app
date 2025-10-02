"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const node_http_1 = __importDefault(require("node:http"));
const node_fs_1 = __importDefault(require("node:fs"));
let win = null;
let nextProc = null;
let spawning = false;
const PORT = process.env.PORT || "3001";
const WAIT_MS = 60000;
const RETRY = 700;
function projectRoot() {
    if (electron_1.app.isPackaged) {
        return node_path_1.default.join(process.resourcesPath, "app"); // packaged layout
    }
    // Running locally from dist-electron/main/main.js → go two levels up
    let dir = node_path_1.default.resolve(__dirname, "..", "..");
    // Walk up until we find package.json with node_modules
    while (true) {
        if (node_fs_1.default.existsSync(node_path_1.default.join(dir, "package.json")) &&
            node_fs_1.default.existsSync(node_path_1.default.join(dir, "node_modules")))
            return dir;
        const parent = node_path_1.default.dirname(dir);
        if (parent === dir)
            break;
        dir = parent;
    }
    // Fallback
    return process.cwd();
}
function nextCliPath() {
    return node_path_1.default.join(projectRoot(), "node_modules", "next", "dist", "bin", "next");
}
function hasProdBuild() {
    return node_fs_1.default.existsSync(node_path_1.default.join(projectRoot(), ".next", "BUILD_ID"));
}
function mode() {
    if (electron_1.app.isPackaged)
        return "prod";
    if (process.env.USE_PROD === "1")
        return "prod";
    return hasProdBuild() && process.env.FORCE_DEV !== "1" ? "prod" : "dev";
}
function spawnNext() {
    if (nextProc || spawning)
        return;
    spawning = true;
    const root = projectRoot();
    const cli = nextCliPath();
    console.log("[Electron] projectRoot =", root);
    console.log("[Electron] next CLI path =", cli);
    if (!node_fs_1.default.existsSync(cli)) {
        console.error("[Electron] next CLI missing:", cli);
        spawning = false;
        return;
    }
    const m = mode();
    const args = m === "prod" ? ["start", "-p", PORT] : ["dev", "-p", PORT];
    console.log(`[Electron] Spawning Next (${m}) ->`, args.join(" "));
    nextProc = (0, node_child_process_1.spawn)(process.execPath, [cli, ...args], {
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
function waitFor(url) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const attempt = () => {
            node_http_1.default
                .get(url, (res) => {
                res.resume();
                if ((res.statusCode || 0) < 500)
                    return resolve();
                retry();
            })
                .on("error", retry);
        };
        const retry = () => {
            if (Date.now() - start > WAIT_MS)
                return reject(new Error("timeout"));
            setTimeout(attempt, RETRY);
        };
        attempt();
    });
}
function attachImage404Logging(w) {
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
    }
    catch {
        console.warn("[Electron] Next not confirmed ready (continuing)");
    }
    win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    attachImage404Logging(win);
    console.log("[Electron] Loading:", url);
    try {
        await win.loadURL(url);
    }
    catch (e) {
        console.error("[Electron] Load failed:", e.message);
        win.loadURL("data:text/plain,Failed to load Next application.");
    }
    win.on("closed", () => {
        win = null;
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (nextProc) {
        nextProc.kill();
        nextProc = null;
    }
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (!win)
        createWindow();
});
