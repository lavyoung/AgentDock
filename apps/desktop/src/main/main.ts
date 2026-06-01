import {app, BrowserWindow} from "electron";
import path from "node:path";

import {ensureAgentDockDirs} from "../core/storage/paths";
import {migrate} from "../core/db/database";

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, "../renderer/index.html"));
    }
}

app.whenReady().then(async () => {
    await ensureAgentDockDirs();
    migrate();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});