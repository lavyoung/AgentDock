export interface ElectronAPI {
    setOverlay(theme: "dark" | "light"): Promise<void>;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
