import {contextBridge, ipcRenderer} from "electron";
import type {AgentdockApi} from "../shared/agentdockApi";

const agentdockApi: AgentdockApi = {
    app: {
        name: "AgentDock",
    },
    assets: {
        list: () => ipcRenderer.invoke("assets:list"),
        get: (id) => ipcRenderer.invoke("assets:get", id),
        create: (input) => ipcRenderer.invoke("assets:create", input),
        update: (id, input) => ipcRenderer.invoke("assets:update", id, input),
    },
    snapshots: {
        list: (assetId) => ipcRenderer.invoke("snapshots:list", assetId),
        restore: (snapshotId) => ipcRenderer.invoke("snapshots:restore", snapshotId),
    },
};

contextBridge.exposeInMainWorld("agentdock", agentdockApi);
