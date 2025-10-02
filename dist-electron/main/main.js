"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const PORT = String(process.env.PORT || 3001);
const WAIT_MS = 60000;
const RETRY = 700;
function projectRoot() {
    if (electron_1.app.isPackaged) {
        return electron_1.app.getAppPath();
    }
    return node_path_1.default.resolve(__dirname, "..", "..");
}
function nextCliPath(root) {
    return node_path_1.default.join(root, "node_modules", "next", "dist", "bin", "next");
}
function hasProdBuild(root) {
    return node_fs_1.default.existsSync(node_path_1.default.join(root, ".next", "BUILD_ID"));
}
function mode(root) {
    if (electron_1.app.isPackaged)
        return "prod";
    if (process.env.USE_PROD === "1")
        return "prod";
    return hasProdBuild(root) ? "prod" : "dev";
}
async function fallbackProgrammatic(root) {
    try {
        console.log("[Electron] Fallback: starting Next programmatically");
        const nextModule = await Promise.resolve(`${node_path_1.default.join(root, "node_modules", "next")}`).then(s => __importStar(require(s)));
        const next = nextModule.default || nextModule;
        const nextApp = next({ dev: false, dir: root, port: Number(PORT) });
        await nextApp.prepare();
        const handler = nextApp.getRequestHandler();
        const httpModule = await Promise.resolve().then(() => __importStar(require("node:http")));
        httpModule
            .createServer((req, res) => handler(req, res))
            .listen(PORT, () => console.log("[Electron] Programmatic Next listening on", PORT));
    }
    catch (e) {
        console.error("[Electron] Programmatic fallback failed:", e);
    }
}
function spawnNext() {
    if (nextProc || spawning)
        return;
    spawning = true;
    const root = projectRoot();
    const cli = nextCliPath(root);
    console.log("[Electron] packaged =", electron_1.app.isPackaged);
    console.log("[Electron] projectRoot =", root);
    console.log("[Electron] in asar =", root.includes(".asar"));
    console.log("[Electron] next CLI exists =", node_fs_1.default.existsSync(cli));
    console.log("[Electron] .next BUILD_ID =", hasProdBuild(root));
    console.log("[Electron] public exists =", node_fs_1.default.existsSync(node_path_1.default.join(root, "public")));
    console.log("[Electron] .contentlayer exists =", node_fs_1.default.existsSync(node_path_1.default.join(root, ".contentlayer")));
    if (!node_fs_1.default.existsSync(cli)) {
        console.error("[Electron] next CLI missing; using fallback.");
        spawning = false;
        void fallbackProgrammatic(root);
        return;
    }
    const m = mode(root);
    const args = m === "prod" ? ["start", "-p", PORT] : ["dev", "-p", PORT];
    console.log(`[Electron] Spawning Next (${m})`, args.join(" "));
    nextProc = (0, node_child_process_1.spawn)(process.execPath, [cli, ...args], {
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
async function createWindow() {
    spawnNext();
    const url = `http://localhost:${PORT}`;
    try {
        await waitFor(url);
    }
    catch {
        console.warn("[Electron] Next not confirmed ready:", url);
    }
    win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    console.log("[Electron] Loading URL:", url);
    try {
        await win.loadURL(url);
    }
    catch (e) {
        console.error("[Electron] loadURL failed:", e.message);
        win.loadURL("data:text/plain,Failed to load Next server (see console).");
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
