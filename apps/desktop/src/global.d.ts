export {};

declare global {
    interface Window {
        agentdock: {
            app: {
                name: string;
            };
            assets: {
                list: () => Promise<any[]>;
                get: (id: string) => Promise<any>;
                create: (input: unknown) => Promise<any>;
                update: (id: string, input: unknown) => Promise<any>;
            };
            snapshots: {
                list: (assetId: string) => Promise<any[]>;
                restore: (snapshotId: string) => Promise<any>;
            };
        };
    }
}