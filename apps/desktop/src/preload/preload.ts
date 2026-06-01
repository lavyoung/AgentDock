import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("agentdock", {
    app: {
        name: "AgentDock",
    },
    assets: {
        list: () => ipcRenderer.invoke("assets:list"),
        create: (input: unknown) => ipcRenderer.invoke("assets:create", input),
    },
});