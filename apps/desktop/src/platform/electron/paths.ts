import {app} from "electron";

import {nodeFileSystemPort, nodePathPort} from "./fileSystemPort";

export function getAgentDockDataDir(): string {
    return nodePathPort.join(app.getPath("home"), ".agentdock");
}

export function getRegistryAssetsDir(): string {
    return nodePathPort.join(getAgentDockDataDir(), "registry", "assets");
}

export function getDbPath(): string {
    return nodePathPort.join(getAgentDockDataDir(), "agentdock.db");
}

export async function ensureAgentDockDirs(): Promise<string> {
    const root = getAgentDockDataDir();

    await nodeFileSystemPort.ensureDir(root);
    await nodeFileSystemPort.ensureDir(nodePathPort.join(root, "registry"));
    await nodeFileSystemPort.ensureDir(getRegistryAssetsDir());
    await nodeFileSystemPort.ensureDir(
        nodePathPort.join(root, "registry", "targets")
    );
    await nodeFileSystemPort.ensureDir(
        nodePathPort.join(root, "registry", "deployments")
    );

    return root;
}
