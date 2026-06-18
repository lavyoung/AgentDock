/**
 * Shell-side (window chrome) API contract.
 *
 * This interface is the only thing the rest of the renderer should know
 * about the host shell's window-level commands. The implementation lives
 * behind `window.electron` (installed by the Electron preload) and is
 * surfaced through `shellClient`.
 *
 * Owned by the client layer (not by `renderer/types/`) so the contract
 * sits next to the code that consumes it. The global `Window.electron`
 * declaration is added by `client.d.ts` in this folder.
 */

export type ShellTheme = "dark" | "light";

export interface ElectronShellAPI {
    /**
     * Set the OS title-bar overlay color. Mirrors the native
     * `BrowserWindow.setTitleBarOverlay` call on the Electron main
     * process.
     */
    setOverlay(theme: ShellTheme): Promise<void>;
    /**
     * Renderer -> main "I'm mounted, you can show me" signal. The main
     * process uses this to swap the white-flash guard for the actual
     * window content. Fire-and-forget on the IPC side; the renderer's
     * `App.tsx` calls this exactly once in a top-level `useEffect`.
     */
    windowReady(): void;
}
