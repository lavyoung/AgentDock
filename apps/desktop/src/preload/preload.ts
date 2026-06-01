import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("agentdock", {
    app: {
        name: "AgentDock",
    },
    assets: {
        list: () => ipcRenderer.invoke("assets:list"),
        get: (id: string) => ipcRenderer.invoke("assets:get", id),
        create: (input: unknown) => ipcRenderer.invoke("assets:create", input),
        update: (id: string, input: unknown) =>
            ipcRenderer.invoke("assets:update", id, input),
    },
    snapshots: {
        list: (assetId: string) => ipcRenderer.invoke("snapshots:list", assetId),
    },
});