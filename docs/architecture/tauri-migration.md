# AgentDock Tauri Migration

The app runs on **Electron** today. **Tauri 2.x** is the long-term
target. This document is the playbook for the dual-track migration.

The Electron build is **not** being deleted — it stays as the
production build while we land the Tauri port behind it. Both builds
share the same renderer (`apps/desktop/src/renderer/`) and core
(`packages/core/`, `packages/shared/`). The Tauri build only adds a
`src-tauri/` sibling under `apps/desktop/`.

---

## Why dual-track

- The Electron build keeps shipping every release, so users see no
  disruption while we land the Tauri port.
- Tauri commands are added one at a time, behind feature flags. Each
  command is tested in isolation before we wire it from the renderer.
- We delete Electron only after every TS business service has a
  Rust counterpart **and** the renderer talks to Tauri end-to-end.

---

## Repository layout (after Phase 1)

```text
apps/desktop/
  src/
    main/                 # Electron main (kept during dual-track)
    preload/              # Electron preload (kept during dual-track)
    platform/electron/    # NodeFileSystemPort, etc. (kept during dual-track)
    renderer/             # SHARED between Electron and Tauri
  src-tauri/              # NEW: Tauri 2.x side
    Cargo.toml
    tauri.conf.json
    capabilities/
      default.json
    src/
      main.rs             # thin entry → lib::run()
      lib.rs              # tauri::Builder + setup hook
      state.rs            # AppState (placeholder in Phase 1)
      ports/
        mod.rs
        file_system.rs    # FileSystemPort trait (Phase 2 fills bodies)
        database.rs       # DatabasePort trait (Phase 3 fills bodies)
    icons/                # bundled with the app

packages/
  core/                   # SHARED, no platform deps (the migration target)
  shared/                 # SHARED, IPC contract
```

---

## Phases

### Phase 1 — Scaffold (this PR) — DONE

- Generate `apps/desktop/src-tauri/` with the Tauri 2.x layout.
- Add `@tauri-apps/api` and `@tauri-apps/cli` to
  `apps/desktop/package.json` (no business calls yet).
- Add `pnpm tauri:dev` and `pnpm tauri:build` scripts.
- Add `.github/workflows/tauri-smoke.yml` that compiles the Tauri
  shell on all three OSes (no bundle, no signing).
- The existing `release.yml` keeps shipping the Electron build.

### Phase 2 — File system port → Rust

- Fill in `src-tauri/src/ports/file_system.rs`:
  - `tokio::fs` for the file ops
  - `sha2` for `checksum`
- Add `NativeFileSystemPort` impl and wire it into `AppState`.
- Mirror the same method shape as
  `packages/core/src/ports/fileSystemPort.ts` (1:1).
- Tests: port the Node test cases to `cargo test` (snapshot paths,
  empty-file checksum, copy-dirs-into-empty-target, etc.).

### Phase 3 — SQLite → rusqlite + r2d2

- Fill in `src-tauri/src/ports/database.rs`:
  - `r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>` for connection
    pooling across commands
  - Keep the same SQL schema as the Node version so the existing
    `~/.agentdock/agentdock.db` works without a migration
- Add commands for the lowest-risk operations first (read-only
  `list_assets`, `list_targets`) and grow from there.

### Phase 4 — Renderer switches from `ipcRenderer` to `@tauri-apps/api`

- Update `apps/desktop/src/renderer/client/agentdockClient.ts` to
  call `invoke("list_assets", ...)` etc.
- Add a small `if (window.__TAURI_INTERNALS__)` switch so the same
  client works in both the Electron and Tauri builds during the
  overlap.
- Delete `apps/desktop/src/preload/preload.ts` once nothing references
  it.

### Phase 5 — Cut over to Tauri for releases

- Delete `apps/desktop/src/main/`,
  `apps/desktop/src/preload/`, and `apps/desktop/src/platform/electron/`.
- Drop `electron`, `electron-builder`, `@electron/rebuild`,
  `better-sqlite3` from `apps/desktop/package.json`.
- Replace `.github/workflows/release.yml` with a Tauri-action driven
  workflow (`tauri-apps/tauri-action@v0`).
- Retain `tauri-smoke.yml` as the PR-time check.

---

## Local development

### Prerequisites

- Node 20+ and pnpm 11
- Rust toolchain (1.77+): install via <https://rustup.rs/>
- Windows: WebView2 runtime (preinstalled on Windows 11)
- Linux: `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf`
- macOS: Xcode Command Line Tools

### Commands

```bash
pnpm install

# Electron (unchanged) — production build path
pnpm dev              # vite + tsc + electron, hot reload
pnpm dist:win         # NSIS installer via electron-builder

# Tauri (Phase 1+) — target build
pnpm tauri:dev        # vite + cargo, hot reload, opens Tauri window
pnpm tauri:build      # signed/notarized installers (when secrets set)
```

Both run against the same `apps/desktop/src/renderer/` and
`packages/core/`, so a UI change shows up in both builds.

### Renderer-side Tauri detection

```ts
// apps/desktop/src/renderer/client/agentdockClient.ts
import { invoke } from "@tauri-apps/api/core";

export const isTauri = typeof window !== "undefined"
    && "__TAURI_INTERNALS__" in window;

export async function call<T>(channel: string, ...args: unknown[]): Promise<T> {
    if (isTauri) {
        // Tauri 2.x uses flat command names; map "assets:list" → "list_assets"
        return invoke<T>(channel.replace(/([a-z]+):([a-z]+)/i, "$1_$2"), { args });
    }
    // Electron fallback
    return window.agentdock.api(channel, ...args);
}
```

---

## Reference: the IPC contract

`packages/shared/src/agentdockApi.ts` is the source of truth. When
porting a TS service to Rust, generate matching Tauri commands in
`src-tauri/src/commands/<domain>.rs`:

| Electron IPC channel        | Tauri command            |
| --------------------------- | ------------------------ |
| `assets:list`               | `list_assets`            |
| `assets:create`             | `create_asset`           |
| `targets:list`              | `list_targets`           |
| `sync:preview`              | `preview_sync`           |
| `sync:run`                  | `run_sync`               |
| `applications:run-sync`     | `run_application_sync`   |
| ...                         | ...                      |

Naming convention: drop the colon, snake-case the rest. The TS client
in `agentdockClient.ts` does the translation.
