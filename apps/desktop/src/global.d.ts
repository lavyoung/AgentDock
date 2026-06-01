export {};

declare global {
    interface Window {
        agentdock: {
            app: {
                name: string;
            };
            assets: {
                list: () => Promise<any[]>;
                create: (input: unknown) => Promise<any>;
            };
        };
    }
}