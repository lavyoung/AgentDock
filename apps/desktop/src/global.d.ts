export {};

import type {AgentdockApi} from "../../../packages/shared/src/agentdockApi";

declare global {
    interface Window {
        agentdock: AgentdockApi;
    }
}
