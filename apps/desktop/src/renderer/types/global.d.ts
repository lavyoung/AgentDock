export interface ElectronAPI {
    setOverlay(theme: "dark" | "light"): Promise<void>;
    windowReady(): void;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
