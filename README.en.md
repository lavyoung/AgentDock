# 🧭 AgentDock

<p align="center">
  <strong>A local-first asset manager for multi-AI-agent workflows</strong>
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/lang-中文-red" /></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/lang-English-blue" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-prototype-blue" />
  <img src="https://img.shields.io/github/actions/workflow/status/agentdock/AgentDock/ci.yml?style=flat-square&label=CI" />
  <img src="https://img.shields.io/github/v/release/agentdock/AgentDock?style=flat-square&label=release" />
  <img src="https://img.shields.io/badge/desktop-Electron-lightgrey" />
  <img src="https://img.shields.io/badge/future-Tauri%20%2B%20Rust-orange" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB" />
  <img src="https://img.shields.io/badge/storage-SQLite-003B57" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen" />
</p>

---

## 📌 Overview

**AgentDock** is a local-first asset manager for AI agents. It centralizes the configuration, rule, and capability files you reuse across different AI terminals and projects.

AgentDock is designed to support:

* 🧩 Skills
* 📄 AGENTS.md
* 📜 Rules
* 💬 Prompts
* 🗂 Profiles
* 🎯 Targets
* 🔁 Sync Matrix

Core idea:

> Maintain all agent-related assets in one place, then sync them on demand to different projects, tools, or local directories.

---

## 🚧 Current Phase

The project is currently in the **Prototype / Phase 1** stage.

Phase 1 uses **Electron** to quickly validate the product loop and local file-sync capabilities.

Electron is not the target architecture. The current codebase already implements:

* Asset management workflow
* Local Registry structure
* Skill / AGENTS.md Asset editing and saving
* Local snapshot creation and restore
* Target directory management
* Codex Application Settings and directory detection
* Bilingual UI switching (中文 / English)

Planned for the current phase:

* Sync Matrix interactions
* Sync preview and manual sync
* AGENTS.md managed-block merging

Long-term target architecture:

```text
Tauri + React + TypeScript + Rust + SQLite
```

---

## 🧱 Tech Stack

### Current Prototype Stack

| Type              | Tech                  |
| ----------------- | --------------------- |
| Desktop shell     | Electron              |
| Frontend          | React                 |
| Language          | TypeScript            |
| Build tool        | Vite                  |
| Local DB          | SQLite                |
| SQLite driver     | better-sqlite3        |
| Package manager   | pnpm                  |
| State management  | Zustand               |
| Editor            | CodeMirror 6          |
| Markdown / YAML   | gray-matter / yaml    |
| Diff              | jsdiff                |
| File system       | fs-extra              |
| Packaging         | electron-builder      |

---

### Future Target Architecture

| Type       | Tech                    |
| ---------- | ----------------------- |
| Desktop    | Tauri                   |
| Frontend   | React                   |
| Language   | TypeScript              |
| Core       | Rust                    |
| Local DB   | SQLite                  |
| File I/O   | Rust fs / Tauri fs      |
| Git        | git2-rs / system git    |
| Scanning   | Rust                    |
| Packaging  | Tauri Bundler           |

---

## 🏗 Architecture

### Current Prototype Architecture

```text
┌──────────────────────────────┐
│          React UI             │
│  Assets / Targets / Sync      │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│        Electron Main          │
│  IPC / File System / SQLite   │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│          Core Services        │
│  Asset / Target / Sync        │
└───────┬──────────────┬───────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│ SQLite Store │ │ Local File Registry │
└──────────────┘ └────────────────────┘
```

---

### Future Tauri Architecture

```text
┌──────────────────────────────┐
│          React UI             │
│  React + TypeScript + Vite    │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│        Tauri Commands         │
│  Typed bridge: UI ↔ Core      │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│           Rust Core           │
│  File / Sync / Scan / Git     │
└───────┬──────────────┬───────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│   SQLite     │ │ Local File Registry │
└──────────────┘ └────────────────────┘
```

The Rust Core is mainly responsible for:

* File system operations
* Asset synchronization
* Checksum calculation
* AGENTS.md managed-block merging
* Local snapshot management
* Security scanning
* Git backup integration
* Path and permission validation

React + TypeScript is mainly responsible for:

* Asset editor
* Target management
* Sync Matrix
* Diff preview
* Settings page
* State display

---

## 🧠 Design Principles

* **Local-first** — Core data is stored on the local machine by default.
* **Git optional** — Git is only a backup and collaboration capability, not a core dependency.
* **Unified asset model** — Skills, AGENTS.md, Rules, and Prompts are abstracted as a single Asset type.
* **Explicit sync** — An Asset is only synced to the Targets the user chooses.
* **Safe merging** — When modifying existing files, prefer managed blocks.
* **Adapter-ready** — Future Target formats are reached through Adapters, not hard-coded branches.

---

## 📂 Current Directory Layout

AgentDock is a monorepo, and platform-agnostic logic is already being pulled out of the desktop app.

```text
AgentDock/
  apps/
    desktop/
      src/
        main/                 # Electron main process
        preload/              # preload bridge
        platform/
          electron/           # Electron / SQLite / fs implementations
        renderer/
          client/             # agentdockClient
          i18n/               # UI internationalization
        App.tsx               # Current prototype main UI
        main.tsx              # React entry
        global.d.ts           # window API typing

  packages/
    core/
      src/
        asset/                # Asset domain logic and repository interfaces
        ports/                # FileSystem / Path abstractions
        snapshot/             # Snapshot domain logic and repository interfaces
        target/               # Target domain logic and repository interfaces
        types/                # Domain models and base types

    shared/
      src/
        agentdockApi.ts       # Shared contract: renderer / preload / main

  docs/
    architecture/             # Architecture boundaries and migration plan
    mvp/                      # Phase 1 milestone tracking

  AGENTS.md
  README.md
  package.json
  pnpm-workspace.yaml
```

## 📂 Target Directory Layout

As Phase 1 progresses, the directory will evolve toward the structure below. This is a target, not a snapshot of the current state.

```text
AgentDock/
  apps/
    desktop/
      src/
        main/
        preload/
        platform/
          electron/
        renderer/
          client/
          i18n/
          pages/
          components/
          stores/

  packages/
    core/
      src/
        asset/
        target/
        sync/
        snapshot/
        managed-block/
        ports/
        types/

    shared/
      src/
        agentdockApi.ts

    schema/
      src/

    adapters/
      src/
        custom-folder/
        codex/
        claude/
        cursor/
        gemini/

  docs/
    architecture/
    mvp/
    product/
```

## 🗃 Local Data Layout

By default, AgentDock stores local data in:

```text
~/.agentdock/
  agentdock.db
  settings.yaml
  registry/
    assets/
    targets/
    deployments/
```

Example:

```text
~/.agentdock/
  agentdock.db
  registry/
    assets/
      frontend-review/
        current/
          asset.yaml
          SKILL.md
        snapshots/

      frontend-agents/
        current/
          asset.yaml
          AGENTS.md
        snapshots/

    deployments/
      lock.yaml
```

---

## 📦 Asset File Layout

### Skill Asset

```text
registry/assets/frontend-review/
  current/
    asset.yaml
    SKILL.md
  snapshots/
```

```yaml
id: frontend-review
type: skill
name: frontend-review
title: Frontend Code Review
description: Review frontend projects against conventions and implementation details
version: 0.1.0
status: active
tags:
  - frontend
  - review
```

---

### AGENTS.md Asset

```text
registry/assets/frontend-agents/
  current/
    asset.yaml
    AGENTS.md
  snapshots/
```

```yaml
id: frontend-agents
type: agents-md
name: frontend-agents
title: Frontend Project AGENTS.md
description: Agent collaboration rules for frontend projects
version: 0.1.0
status: active
tags:
  - frontend
  - project
```

---

## 🔁 Sync Strategy

### Skill Sync

Default output path in the current Prototype phase:

```text
<target-path>/.agentdock/skills/<asset-id>/SKILL.md
```

Example:

```text
~/projects/demo/.agentdock/skills/frontend-review/SKILL.md
```

---

### AGENTS.md Sync

Default output path in the current Prototype phase:

```text
<target-path>/AGENTS.md
```

To avoid overwriting user-written content, AgentDock uses managed blocks:

```markdown
<!-- agentdock:start frontend-agents@0.1.0 -->
Generated content
<!-- agentdock:end frontend-agents -->
```

When syncing, only the managed block is updated — the user's hand-written content is never touched.

---

## 📥 Download & Install

Get the latest build from the [Releases page](https://github.com/agentdock/AgentDock/releases).

| Platform | Package formats                       | Notes                                 |
| -------- | ------------------------------------ | ------------------------------------- |
| Windows  | `.exe` (NSIS) · `.msi`               | Signed (EV/OV + signtool)             |
| macOS    | `.dmg` (x64 + arm64) · `.zip`        | Signed + notarized (notarytool)       |
| Linux    | `.AppImage` · `.deb` · `.rpm`        | Optional GPG signing                  |

> The cross-platform build pipeline is configured in
> `.github/workflows/release.yml`. See
> [`docs/release/README.md`](docs/release/README.md) for the full release
> process — maintainers push a `vX.Y.Z` tag to trigger it.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/AgentDock.git
cd AgentDock
```

---

### 2. Install pnpm

```bash
npm install -g pnpm
```

Or:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

### 3. Install dependencies

```bash
pnpm install
```

---

### 4. Start the dev environment

```bash
pnpm dev
```

---

### 5. Build

```bash
pnpm build
```

---

## 🧪 Demo Flow

The current Prototype demonstrates the following flow:

1. Create a Skill Asset.
2. Create an AGENTS.md Asset.
3. Open and edit the Asset in the Local Registry.
4. Save — a local snapshot is created automatically.
5. Restore a historical snapshot and verify the rollback.

After sync is implemented, Skill output will look like:

```text
<target-path>/.agentdock/skills/<asset-id>/SKILL.md
```

After sync is implemented, AGENTS.md output will look like:

```text
<target-path>/AGENTS.md
```

---

## 🧭 Roadmap

### Phase 1 — Prototype

* Electron desktop app
* Skill Asset
* AGENTS.md Asset
* Local Registry
* Target directory
* Sync Matrix
* Manual sync
* Local snapshots

### Phase 2 — Core Model

* Rules Asset
* Prompt Asset
* Profile grouping
* Sync preview
* Basic diff
* Snapshot restore

### Phase 3 — Target Adapters

* Claude Adapter
* Codex Adapter
* Cursor Adapter
* Gemini Adapter
* Custom Folder Adapter

### Phase 4 — Tauri Migration

* Migrate desktop shell to Tauri
* Migrate file I/O to Rust
* Migrate sync engine to Rust
* Keep the React + TypeScript UI

### Phase 5 — Backup & Market

* Optional Git backup
* Local import
* ZIP import
* Git-based Market
* HTTP Registry

### Phase 6 — Security

* Asset scanning
* Script policies
* Trust levels
* Risk warnings
* Safe deployment rules

---

## 🧰 Common Commands

```bash
# Install dependencies
pnpm install

# Start dev environment
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Test
pnpm test

# Local packaging (no signing, no per-platform artifacts)
pnpm pack

# Per-platform packaging (no publish — CI signs the artifacts)
pnpm dist:mac        # macOS .dmg + .zip
pnpm dist:win        # Windows .exe + .msi
pnpm dist:linux      # Linux .AppImage + .deb + .rpm

# Release (bump version + tag + push, triggers the release workflow)
pnpm version:bump 0.1.0
git push origin main
pnpm release:tag
```

---

## 📄 License

MIT
