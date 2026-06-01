import {contextBridge} from "electron";

contextBridge.exposeInMainWorld("agentdock", {
    app: {
        name: "AgentDock",
    },
});