import {app, BrowserWindow} from "electron";
import path from "node:path";

import {registerIpc} from "./ipc";
import {migrateDatabase} from "../platform/electron/database";
import {ensureAgentDockDirs} from "../platform/electron/paths";

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 560,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#0a0a0b",
            symbolColor: "#a1a1aa",
            height: 32,
        },
        backgroundColor: "#0a0a0b",
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.once("ready-to-show", () => {
        win.show();
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "../../../../../apps/desktop/dist/index.html"));
    }
}

app.whenReady().then(async () => {
    await ensureAgentDockDirs();
    migrateDatabase();
    registerIpc();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});