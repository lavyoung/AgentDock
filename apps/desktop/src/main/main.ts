import {app, BrowserWindow} from "electron";
import path from "node:path";

import {registerIpc, setMainWindow} from "./ipc";
import {migrateDatabase} from "../platform/electron/database";
import {ensureAgentDockDirs} from "../platform/electron/paths";

const isDev = process.env.NODE_ENV === "development";
const DARK_WINDOW_CHROME = "#0a0a0b";
const APP_TITLE = "AgentDock";

function resolveWindowIconPath(): string {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, "resources", "branding", "icon.png");
    }

    return path.join(app.getAppPath(), "resources", "branding", "icon.png");
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 560,
        title: APP_TITLE,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: DARK_WINDOW_CHROME,
            symbolColor: "#a1a1aa",
            height: 32,
        },
        backgroundColor: DARK_WINDOW_CHROME,
        frame: false,
        icon: resolveWindowIconPath(),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    setMainWindow(win);

    // Safety net: show window after 2s even if the renderer never reports ready.
    setTimeout(() => {
        if (!win.isDestroyed() && !win.isVisible()) {
            // eslint-disable-next-line no-console
            console.warn("[AgentDock] ready-to-show timeout — forcing window show");
            win.show();
        }
    }, 2000);

    win.webContents.on("did-fail-load", (_e, errorCode, errorDescription) => {
        // eslint-disable-next-line no-console
        console.error(`[AgentDock] did-fail-load: ${errorCode} ${errorDescription}`);
    });

    win.webContents.on("render-process-gone", (_e, details) => {
        // eslint-disable-next-line no-console
        console.error(`[AgentDock] render-process-gone: ${JSON.stringify(details)}`);
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "../../../../../apps/desktop/dist/index.html"));
    }
}

app.whenReady().then(async () => {
    app.setName(APP_TITLE);
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
