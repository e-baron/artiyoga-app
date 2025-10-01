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
let starting = false;
const PORT = process.env.PORT || "3001";
const TIMEOUT = 60000;
const RETRY = 600;
const FORCE_DEV = process.env.FORCE_DEV === "1";
function rootDir() {
    return electron_1.app.getAppPath(); // resolves to Resources/app (packaged) or project root (dev)
}
function standaloneDir() {
    return node_path_1.default.join(rootDir(), ".next", "standalone");
}
function serverEntry() {
    return node_path_1.default.join(standaloneDir(), "server.js");
}
function startServer() {
    if (server || starting)
        return;
    starting = true;
    const entry = serverEntry();
    const pubImg = node_path_1.default.join(rootDir(), "public", "images", "raphael.jpg");
    console.log("[Electron] rootDir =", rootDir());
    console.log("[Electron] standaloneDir =", standaloneDir());
    console.log("[Electron] server.js exists =", node_fs_1.default.existsSync(entry));
    console.log("[Electron] sample public image exists =", node_fs_1.default.existsSync(pubImg));
    if (!node_fs_1.default.existsSync(entry)) {
        console.error("[Electron] Missing standalone server:", entry);
        starting = false;
        return;
    }
    server = (0, node_child_process_1.spawn)(process.execPath, [entry], {
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
function attachImage404Logging(w) {
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
    }
    catch {
        console.warn("[Electron] Server not confirmed ready:", url);
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
