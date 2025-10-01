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
let server = null;
const PORT = process.env.PORT || "3001";
const TIMEOUT = 60000;
const RETRY = 600;
const FORCE_DEV = process.env.FORCE_DEV === "1";
function rootDir() {
    return electron_1.app.isPackaged
        ? node_path_1.default.join(process.resourcesPath, "app")
        : node_path_1.default.join(__dirname, "..", "..");
}
function entry() {
    return node_path_1.default.join(rootDir(), ".next", "standalone", "server.js");
}
function startServer() {
    if (server)
        return;
    const e = entry();
    if (!node_fs_1.default.existsSync(e)) {
        console.error("[Electron] Missing standalone server:", e);
        return;
    }
    console.log("[Electron] Starting standalone Next:", e, "PORT", PORT);
    server = (0, node_child_process_1.spawn)(process.execPath, [e], {
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
            if (Date.now() - start > TIMEOUT)
                return reject(new Error("timeout"));
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
    }
    catch {
        console.warn("[Electron] Server not confirmed ready");
    }
    win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    console.log("[Electron] Loading:", url);
    try {
        await win.loadURL(url);
    }
    catch (e) {
        console.error("[Electron] Load failed:", e.message);
        win.loadURL("data:text/plain,Failed to load Next server.");
    }
    win.on("closed", () => {
        win = null;
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (server) {
        server.kill();
        server = null;
    }
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (!win)
        createWindow();
});
