/**
 * Renderer-side shell client.
 *
 * Owns every renderer → main "shell" call (window chrome, native
 * lifecycle). Pages, components, and `App.tsx` should not touch
 * `window.electron` directly — they go through `shellClient`.
 *
 * When no real shell is present (mock / dev fallback / Tauri phase 2),
 * every call becomes a no-op so the renderer can keep working in a
 * plain browser tab.
 */

import type {ElectronShellAPI, ShellTheme} from "./shellTypes";
import {runtime} from "./runtime";

export interface ShellClient {
    /**
     * Signal the main process that the renderer is mounted and ready
     * to be shown. Safe to call multiple times — the implementation
     * is idempotent on the main side.
     */
    windowReady(): void;
    /**
     * Push the title-bar overlay color to match the current theme.
     * Resolves once the main process has applied the overlay (or
     * immediately when no shell is present).
     */
    setOverlay(theme: ShellTheme): Promise<void>;
}

function withShell<T>(fallback: T, action: (api: ElectronShellAPI) => T): T {
    const api = runtime.getShellApi();
    if (!api) {
        return fallback;
    }
    try {
        return action(api);
    } catch {
        // Mock / dev / Tauri phase 2 — never let a shell-call failure
        // crash the renderer. The error is intentionally swallowed.
        return fallback;
    }
}

export const shellClient: ShellClient = Object.freeze({
    windowReady(): void {
        withShell<void>(undefined, (api) => {
            api.windowReady();
        });
    },
    async setOverlay(theme: ShellTheme): Promise<void> {
        try {
            await withShell<Promise<void>>(Promise.resolve(), (api) => api.setOverlay(theme));
        } catch {
            // Mirror the sync fallback behavior above: shell bridge
            // failures must never leak into renderer state updates.
        }
    },
});
