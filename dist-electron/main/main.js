"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
let mainWindow = null;
const isDev = !electron_1.app.isPackaged;
const DEV_PORT = process.env.PORT || "3001";
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "../main/preload.js") // after build: dist-electron/main/preload.js
        }
    });
    if (isDev) {
        const url = `http://localhost:${DEV_PORT}`;
        console.log("[Electron] Loading dev URL:", url);
        mainWindow.loadURL(url);
    }
    else {
        // For production (static export) adjust path if you keep output:"export"
        mainWindow.loadFile(node_path_1.default.join(__dirname, "../out/index.html"));
    }
    mainWindow.on("closed", () => { mainWindow = null; });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (mainWindow === null)
        createWindow();
});
