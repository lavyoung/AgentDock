import {defineConfig} from "vitest/config";

/**
 * Vitest configuration for `@agentdock/core`.
 *
 * Scope: only the pure-logic / pure-helper modules under
 * `packages/core/src/**` are exercised. Anything that needs the
 * Electron / Tauri runtime stays in `apps/desktop` and is not
 * referenced from these tests.
 *
 * The repo uses `tsconfig.electron.json` for the desktop build, but
 * vitest is a separate consumer with its own resolver. We tell vitest
 * the same workspace path-aliases that the desktop build uses so the
 * `@agentdock/shared/contract/*` imports keep working.
 */
export default defineConfig({
    resolve: {
        alias: {
            "@agentdock/shared/agentdockApi": new URL(
                "../shared/src/agentdockApi.ts",
                import.meta.url
            ).pathname,
            "@agentdock/shared/contract": new URL(
                "../shared/src/contract/index.ts",
                import.meta.url
            ).pathname,
            "@agentdock/shared/contract/": new URL(
                "../shared/src/contract/",
                import.meta.url
            ).pathname,
        },
    },
    test: {
        include: ["src/**/*.test.ts"],
        environment: "node",
        pool: "forks",
        reporters: ["default"],
    },
});
