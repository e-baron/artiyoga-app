import { app, BrowserWindow } from "electron";
import path from "node:path";

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;
const DEV_PORT = process.env.PORT || "3001";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "../main/preload.js") // after build: dist-electron/main/preload.js
    }
  });

  if (isDev) {
    const url = `http://localhost:${DEV_PORT}`;
    console.log("[Electron] Loading dev URL:", url);
    mainWindow.loadURL(url);
  } else {
    // For production (static export) adjust path if you keep output:"export"
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});