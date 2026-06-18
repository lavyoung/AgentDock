/**
 * Renderer-side runtime detection.
 *
 * This module is the **only** place in the renderer that is allowed to
 * inspect `window` to figure out which host shell is currently in front of
 * the React app. Every other module — pages, components, the App root,
 * `agentdockClient`, `shellClient` — must go through the singleton
 * `runtime` exported here.
 *
 * The split is:
 *
 *   - `agentdockClient` calls `runtime.getBusinessApi()` to decide between
 *     real-IPC and in-memory mock data.
 *   - `shellClient` calls `runtime.getShellApi()` to decide whether to
 *     fire-and-forget `windowReady` / `setOverlay` IPCs or no-op them.
 *   - `App.tsx` and the page components must NOT touch `window.electron`
 *     or `window.agentdock` directly. They go through `shellClient` /
 *     `agentdockClient` only.
 *
 * Mock / dev fallback is preserved: when the page is opened in a plain
 * browser tab (no preload, no Tauri), `getBusinessApi()` and
 * `getShellApi()` both return `null` and the rest of the renderer
 * continues to function (with mock data, no-op shell calls).
 */

import type {AgentdockApi} from "../../../../../packages/shared/src/agentdockApi";
import type {ElectronShellAPI} from "./shellTypes";

/**
 * The kind of host shell currently in front of the renderer.
 *
 *   - `"electron"` — running inside Electron with the preload bridge.
 *   - `"tauri"`    — running inside Tauri (placeholder for Phase 2; the
 *                    renderer does not yet talk to Tauri commands).
 *   - `"mock"`     — Vite `MODE === "mock"`. The renderer should always
 *                    use in-memory mock data even if a real shell happens
 *                    to expose `window.agentdock` (e.g. when the user
 *                    explicitly opts in for a browser preview).
 *   - `"browser"`  — neither electron / tauri / mock. Fallback to mock
 *                    data and no-op shell behavior.
 */
export type RuntimeKind = "electron" | "tauri" | "mock" | "browser";

/**
 * Public surface of the runtime detector. Methods are intentionally
 * non-throwing: when no host shell is present they return `null` and
 * let callers gracefully degrade.
 */
export interface Runtime {
    /**
     * Identified host shell. Computed once and cached.
     */
    readonly kind: RuntimeKind;
    readonly isElectron: boolean;
    readonly isTauri: boolean;
    readonly isMock: boolean;
    readonly isBrowser: boolean;
    /**
     * Returns the business-side `window.agentdock` bridge installed by
     * the Electron preload, or `null` if no shell is present. Used by
     * `agentdockClient` to pick between real-IPC and mock data.
     */
    getBusinessApi(): AgentdockApi | null;
    /**
     * Returns the shell-side `window.electron` bridge installed by the
     * Electron preload (`windowReady` / `setOverlay`), or `null` if no
     * shell is present. Used by `shellClient`.
     */
    getShellApi(): ElectronShellAPI | null;
}

function hasOwn(value: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(value, key);
}

function detectKind(): RuntimeKind {
    if (import.meta.env.MODE === "mock") {
        return "mock";
    }

    if (typeof window === "undefined") {
        return "browser";
    }

    if (hasOwn(window, "__TAURI_INTERNALS__")) {
        return "tauri";
    }

    if (hasOwn(window, "agentdock") || hasOwn(window, "electron")) {
        return "electron";
    }

    return "browser";
}

function readBusinessApi(): AgentdockApi | null {
    if (typeof window === "undefined") {
        return null;
    }
    return (window as {agentdock?: AgentdockApi}).agentdock ?? null;
}

function readShellApi(): ElectronShellAPI | null {
    if (typeof window === "undefined") {
        return null;
    }
    return (window as {electron?: ElectronShellAPI}).electron ?? null;
}

const detectedKind: RuntimeKind = detectKind();

/**
 * Singleton runtime descriptor. Frozen so consumers cannot mutate the
 * detection result at runtime.
 */
export const runtime: Runtime = Object.freeze({
    kind: detectedKind,
    isElectron: detectedKind === "electron",
    isTauri: detectedKind === "tauri",
    isMock: detectedKind === "mock",
    isBrowser: detectedKind === "browser",
    getBusinessApi: readBusinessApi,
    getShellApi: readShellApi,
});
