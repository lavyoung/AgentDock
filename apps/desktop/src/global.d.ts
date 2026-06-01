export {};

import type {AgentdockApi} from "./shared/agentdockApi";

declare global {
    interface Window {
        agentdock: AgentdockApi;
    }
}
