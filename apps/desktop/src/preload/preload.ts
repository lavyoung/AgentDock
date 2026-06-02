import {contextBridge, ipcRenderer} from "electron";
import type {AgentdockApi} from "../../../../packages/shared/src/agentdockApi";

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
    applications: {
        list: () => ipcRenderer.invoke("applications:list"),
        get: (id) => ipcRenderer.invoke("applications:get", id),
        update: (id, input) => ipcRenderer.invoke("applications:update", id, input),
        refreshLocations: (id) =>
            ipcRenderer.invoke("applications:refresh-locations", id),
        updateLocation: (id, input) =>
            ipcRenderer.invoke("applications:update-location", id, input),
    },
};

contextBridge.exposeInMainWorld("agentdock", agentdockApi);
