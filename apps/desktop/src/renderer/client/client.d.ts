/**
 * Client-layer global declarations.
 *
 * The renderer client layer (`./runtime.ts`, `./agentdockClient.ts`,
 * `./shellClient.ts`) is the single source of truth for everything
 * the host shell exposes on `window`. Per the renderer-shell
 * convergence (Task 4 / Group D), no other module may declare
 * additions to `Window` directly.
 *
 * The two globals are:
 *
 *   - `window.agentdock` — the business API (assets, scenarios, sync,
 *     etc). Installed by the Electron preload via `contextBridge`.
 *   - `window.electron`  — the shell API (windowReady, setOverlay).
 *     Installed by the same preload.
 *
 * Both are typed as optional where appropriate so the renderer can
 * still type-check in mock / browser / Tauri (phase 2) modes where
 * neither is present.
 */

import type {AgentdockApi} from "../../../../../packages/shared/src/agentdockApi";
import type {ElectronShellAPI} from "./shellTypes";

declare global {
    interface Window {
        agentdock: AgentdockApi;
        electron?: ElectronShellAPI;
    }
}

export {};
