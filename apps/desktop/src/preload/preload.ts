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
    targets: {
        list: () => ipcRenderer.invoke("targets:list"),
        get: (id) => ipcRenderer.invoke("targets:get", id),
        create: (input) => ipcRenderer.invoke("targets:create", input),
        update: (id, input) => ipcRenderer.invoke("targets:update", id, input),
        delete: (id) => ipcRenderer.invoke("targets:delete", id),
    },
};

contextBridge.exposeInMainWorld("agentdock", agentdockApi);
