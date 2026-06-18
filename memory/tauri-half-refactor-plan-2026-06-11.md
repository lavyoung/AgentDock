# AgentDock Tauri Half Refactor Plan

Updated: 2026-06-11

## Background

The current repository is already moving in the right direction for the Tauri migration:

- `packages/core` has been extracted
- `apps/desktop/src-tauri` exists and can compile
- renderer code is mostly shared between Electron and Tauri

The main issue is that the architecture is still only partially decoupled:

- `packages/shared` is not yet an independent contract layer
- TypeScript and Rust platform ports do not yet match 1:1
- sync logic is split across two parallel service lines
- renderer still has small Electron-aware entry points

This plan intentionally covers only the first half of the refactor, meaning the highest-leverage convergence work that should happen before large-scale Tauri command migration.

## Goal

Reduce Tauri migration cost by converging the current architecture onto a single set of stable boundaries.

After this half-refactor, the codebase should have:

1. A stable cross-layer contract source
2. A single platform port shape that both Electron and Tauri can implement
3. A single sync domain model and execution path
4. A renderer that depends on one client abstraction instead of Electron-specific globals

## Non-goals

This round does not aim to:

- fully remove Electron
- finish all Rust business command implementations
- redesign the UI
- introduce a full adapter plugin system
- migrate every repository implementation to Rust immediately

## Why this is the right stopping point

If we do not stop and converge now, later migration work will be duplicated:

- once in TypeScript service refactors
- once again in Rust command wiring

This half-refactor is the point where we pay down the architectural debt before the debt gets copied into two platforms.

## Target outcome

The desired boundary shape after this round is:

```text
renderer
  -> agentdockClient
  -> shared contract

desktop shell (Electron or Tauri)
  -> shared contract
  -> core services
  -> platform ports

core
  -> domain logic
  -> repository interfaces
  -> platform-neutral sync planning/execution

platform implementations
  -> filesystem
  -> database
  -> native dialogs / shell utilities
```

## Scope

This plan is split into four workstreams:

1. Shared contract convergence
2. Platform port convergence
3. Sync domain convergence
4. Renderer client convergence

Only the first three are mandatory for this round.

The fourth can start in this round, but may finish in the next one if needed.

## Workstream 1: Shared contract convergence

### Problem

`packages/shared` still imports types from `packages/core`, which means it is not actually the stable boundary between renderer and native shell.

That causes these risks:

- contract changes leak directly from core into UI
- Tauri commands cannot cleanly target one shared DTO source
- shared cannot act as the migration seam

### Refactor direction

Move cross-layer DTOs and command-facing types into `packages/shared`.

Recommended shape:

```text
packages/shared/src/
  contract/
    assets.ts
    targets.ts
    applications.ts
    sync.ts
    scenarios.ts
    rules.ts
  agentdockApi.ts
```

### Rules

- `shared` may depend on primitive TS types only
- `shared` must not import from `core`
- `core` may import selected DTOs from `shared` only if necessary, but domain types should remain primarily inside `core`
- renderer and platform shells should reference `shared` contract types first

### Suggested tasks

- [ ] Extract API-facing DTOs from `core/src/types/*` into `shared/src/contract/*`
- [ ] Update `packages/shared/src/agentdockApi.ts` to import only from `shared`
- [ ] Decide which types remain domain types in `core` and which become transport DTOs
- [ ] Keep naming stable for Tauri command mapping

### Acceptance

- `packages/shared` has no import path into `packages/core`
- `agentdockApi.ts` is fully self-contained inside `shared`
- Electron preload and future Tauri commands can both compile against the same contract package

## Workstream 2: Platform port convergence

### Problem

The TypeScript `FileSystemPort` and Rust `FileSystemPort` do not currently expose the same behavior surface.

Examples:

- TS has `emptyDir`
- TS has optional `commandExists`
- Rust has `copy_file`
- Rust has `checksum`

This means the Tauri side cannot become a drop-in replacement for the current core services.

### Refactor direction

Define one canonical platform port contract first, then align both Electron and Tauri to it.

Recommended approach:

```text
core/ports = source of truth
Electron impl = exact implementation of core/ports
Rust impl = exact implementation of core/ports
```

### Recommended port split

Instead of one overloaded file-system port, split responsibilities where needed:

```text
FileSystemPort
PathPort
ShellPort
```

Suggested responsibilities:

- `FileSystemPort`: exists, read/write, ensureDir, copyDir, remove, emptyDir
- `PathPort`: join, dirname, basename, isAbsolute
- `ShellPort`: commandExists

This avoids hiding shell/process checks inside filesystem concerns.

### Suggested tasks

- [ ] Freeze the canonical TS port shape in `packages/core/src/ports`
- [ ] Decide whether `commandExists` stays optional or moves to a dedicated `ShellPort`
- [ ] Update Electron implementations to match the final contract exactly
- [ ] Update Rust traits to match the same contract exactly
- [ ] Remove any method that exists only on one side without a domain reason

### Acceptance

- Electron and Tauri can instantiate the same core services without service-specific conditionals
- no core service depends on a method that only one native side provides
- Rust port stubs map 1:1 to the TypeScript contract

## Workstream 3: Sync domain convergence

### Problem

There are currently two sync lines:

1. `SyncService`
2. `ApplicationSyncService`

They overlap heavily in planning, asset filtering, output path resolution, merge behavior, and write execution.

Worse, they already differ in output semantics:

- one writes skills by `asset.id`
- one writes skills by `asset.name`

If this is not resolved now, the Tauri migration will duplicate the inconsistency.

### Refactor direction

Split sync into composable domain parts instead of separate top-level service trees.

Recommended target structure:

```text
packages/core/src/sync/
  syncPlanner.ts
  syncExecutor.ts
  syncTypes.ts
  destinationResolver.ts
  managedBlockWriter.ts
```

And conceptually:

```text
Scenario + Destination Set
  -> Sync Planner
  -> Sync Plan
  -> Sync Executor
```

### Proposed model

- `SyncPlanner` produces normalized operations only
- `SyncExecutor` applies operations through ports only
- `DestinationResolver` converts:
  - target-based sync destinations
  - application-location sync destinations
  into one normalized destination model

Example normalized destination:

```ts
type SyncDestination = {
  id: string;
  name: string;
  rootPath: string;
  kind: "target" | "application-location";
  assetRouting: "skill" | "agents-md" | "mixed";
  strategy: "copy" | "merge";
};
```

### Key decision to make early

Pick one canonical skill output identity:

1. `asset.id`
2. `asset.name`

Recommendation:

- use `asset.id` for storage-stable output paths
- keep `asset.name` as display metadata only

That is safer for rename scenarios and snapshot tracking.

### Suggested tasks

- [ ] Define a normalized sync destination model
- [ ] Extract shared planning logic from `SyncService` and `ApplicationSyncService`
- [ ] Extract shared execution logic for skill writes and AGENTS.md merge writes
- [ ] Standardize output path rules for Skill and AGENTS.md assets
- [ ] Keep managed block merge as pure function, but wrap write flow in one reusable sync helper

### Acceptance

- there is one sync planning pipeline
- there is one sync execution pipeline
- target sync and application-location sync differ only in destination resolution, not in core write logic
- output path semantics are documented and consistent

## Workstream 4: Renderer client convergence

### Problem

Renderer is mostly clean, but it still has Electron-aware globals such as `window.electron`.

That is small technically, but important architecturally, because it weakens the rule that renderer should not care whether the shell is Electron or Tauri.

### Refactor direction

Keep one `agentdockClient` entry point and move platform branching under it.

Recommended shape:

```text
renderer
  -> agentdockClient
      -> Electron bridge or Tauri invoke
```

### Suggested tasks

- [ ] Move `windowReady` and overlay calls behind a shell-aware client helper
- [ ] Add Tauri detection inside client infrastructure, not inside pages or `App.tsx`
- [ ] Ensure renderer pages never directly reference `window.electron` or `window.agentdock`

### Acceptance

- `App.tsx` and renderer pages do not touch Electron globals directly
- platform detection exists in one place only
- the shared renderer can boot under mock, Electron, or Tauri through the same client boundary

## Recommended execution order

Do the work in this order:

1. Shared contract convergence
2. Platform port convergence
3. Sync domain convergence
4. Renderer client convergence

This order matters because:

- contract convergence defines the API seam
- port convergence defines the native seam
- sync convergence removes duplicated business rules
- renderer convergence becomes much easier once the lower seams are stable

## Suggested implementation phases

### Phase A. Freeze boundaries

- [ ] Create `shared/contract` structure
- [ ] Move API-facing DTOs
- [ ] Freeze canonical platform port interfaces
- [ ] Document stable output path rules

### Phase B. Remove duplication

- [ ] Extract normalized sync destination model
- [ ] Introduce shared sync planner
- [ ] Introduce shared sync executor
- [ ] Reduce `ApplicationSyncService` to destination resolution plus orchestration

### Phase C. Prepare dual-runtime shell

- [ ] Add platform-aware client layer
- [ ] Hide Electron-only globals behind client helpers
- [ ] Make Tauri command mapping align to `shared` contract names

## Deliverables

At the end of this half-refactor, the repo should contain:

- a `shared` package that is truly independent
- one stable set of platform port interfaces
- one canonical sync path model
- one canonical sync execution path
- one renderer client seam for Electron and Tauri

## Risks

### Risk 1. Over-refactoring before behavior freeze

If sync logic is heavily reorganized before output rules are frozen, regressions may be hard to spot.

Mitigation:

- lock output path semantics first
- write fixture tests before moving logic

### Risk 2. Domain types and DTO types become blurred again

If the team copies everything from `core/types` into `shared` without separation, the same coupling problem returns in another form.

Mitigation:

- explicitly tag types as either domain model or transport contract

### Risk 3. Tauri stubs drift from TypeScript again

If TS interfaces keep changing after Rust traits are scaffolded, drift will return quickly.

Mitigation:

- treat `core/ports` as the single source of truth
- update Rust stubs in the same PR when a port changes

## Test strategy for this round

This round should add tests before deeper migration continues.

Priority order:

1. Managed block merge tests
2. Managed block removal tests
3. Sync plan fixture tests
4. Sync output path tests
5. Destination resolution tests

Recommended minimum rule:

- every refactor that changes sync planning must add or update a fixture-style test

## First batch task list

This is the concrete first batch I recommend implementing next:

- [ ] Create `packages/shared/src/contract/`
- [ ] Move `AgentdockApi` dependent DTOs out of `core`
- [ ] Freeze `FileSystemPort`, `PathPort`, and possible `ShellPort`
- [ ] Align Electron port implementations to the frozen interfaces
- [ ] Align Rust port traits to the same frozen interfaces
- [ ] Write a short architecture note for canonical Skill output path semantics
- [ ] Extract a normalized sync destination type
- [ ] Identify which methods in `ApplicationSyncService` can move into shared sync helpers
- [ ] Add first tests for `mergeManagedBlock` and `removeManagedBlock`

## Definition of done for this half-refactor

This plan is considered complete when:

- `shared` no longer imports from `core`
- core services can run against either Electron or Tauri port implementations without interface drift
- sync logic no longer has two independent output-rule implementations
- renderer shell-awareness is centralized behind client infrastructure
- the migration can proceed command-by-command instead of service-by-service duplication

## Notes for follow-up round

The next round after this half-refactor should focus on:

- implementing the first real Tauri commands against the converged interfaces
- moving database-backed read operations first
- then moving sync preview
- then moving sync execution

That second half should be much safer once this convergence work is done.
