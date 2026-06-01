import {app} from "electron";
import path from "node:path";
import fs from "fs-extra";

export function getAgentDockDataDir() {
    return path.join(app.getPath("home"), ".agentdock");
}

export async function ensureAgentDockDirs() {
    const root = getAgentDockDataDir();

    await fs.ensureDir(root);
    await fs.ensureDir(path.join(root, "registry"));
    await fs.ensureDir(path.join(root, "registry/assets"));
    await fs.ensureDir(path.join(root, "registry/targets"));
    await fs.ensureDir(path.join(root, "registry/deployments"));

    return root;
}

export function getDbPath() {
    return path.join(getAgentDockDataDir(), "agentdock.db");
}