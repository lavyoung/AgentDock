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
        setStatus: (id, status) => ipcRenderer.invoke("assets:setStatus", id, status),
        delete: (id) => ipcRenderer.invoke("assets:delete", id),
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
    rules: {
        list: () => ipcRenderer.invoke("rules:list"),
        get: (id) => ipcRenderer.invoke("rules:get", id),
        create: (input) => ipcRenderer.invoke("rules:create", input),
        update: (id, input) => ipcRenderer.invoke("rules:update", id, input),
        delete: (id) => ipcRenderer.invoke("rules:delete", id),
    },
    scenarios: {
        list: () => ipcRenderer.invoke("scenarios:list"),
        get: (id) => ipcRenderer.invoke("scenarios:get", id),
        create: (input) => ipcRenderer.invoke("scenarios:create", input),
        update: (id, input) => ipcRenderer.invoke("scenarios:update", id, input),
        delete: (id) => ipcRenderer.invoke("scenarios:delete", id),
        addAsset: (scenarioId, field, assetId) =>
            ipcRenderer.invoke("scenarios:add-asset", scenarioId, field, assetId),
        removeAsset: (scenarioId, field, assetId) =>
            ipcRenderer.invoke("scenarios:remove-asset", scenarioId, field, assetId),
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
contextBridge.exposeInMainWorld("electron", {
    setOverlay: (theme: "dark" | "light") => ipcRenderer.invoke("window:setOverlay", theme),
    windowReady: () => ipcRenderer.send("window:ready"),
});
