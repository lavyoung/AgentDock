# AgentDock Desktop Prototype

This package contains the current Electron-based prototype for AgentDock.

## Current scope

- Asset creation, listing, reading, and updating
- Local Registry persistence under `~/.agentdock/registry/assets`
- Skill and `AGENTS.md` asset file generation
- Local snapshot creation and restore
- Renderer-to-platform isolation through a typed client and Electron platform adapters

## Architecture

- `src/App.tsx`: current prototype screen
- `src/renderer/client/agentdockClient.ts`: renderer-side client abstraction
- `src/core/`: platform-agnostic business services, ports, and types
- `src/platform/electron/`: Electron-specific file system, paths, and SQLite implementations
- `src/main/`: Electron window bootstrapping and IPC registration
- `src/preload/`: safe API exposure to the renderer

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
```

## Planned next

- Target management
- Sync Matrix
- Sync preview and execution
- Managed block merge for `AGENTS.md`
