# AgentDock Tauri Refactor Task Breakdown

Updated: 2026-06-11

## Purpose

This document is the execution guide for the current Tauri migration convergence work.

It is written for delegation:

- one model or engineer executes the code changes
- one reviewer checks architecture consistency
- this document acts as the shared contract for both sides

This is not a broad roadmap.

This is the concrete task breakdown for the next refactor rounds.

## Current main objective

The current technical priority is:

```text
Converge boundaries before deep Tauri migration continues
```

That means the immediate goal is not "add more features".

The immediate goal is:

1. make `shared` a real contract layer
2. unify platform ports
3. unify sync logic
4. reduce renderer awareness of Electron

## Global execution rules

These rules apply to every task below.

### Must preserve

- existing Phase 1 product loop must remain usable
- Electron build must continue to work during the transition
- Tauri scaffold must continue to compile
- `packages/core` must remain platform-neutral
- AGENTS.md managed block behavior must not regress

### Must avoid

- do not move Electron APIs into renderer or core
- do not introduce new direct `window.electron` usage
- do not add more sync rule duplication
- do not mix transport DTOs and domain types without naming them clearly
- do not rewrite large areas "for cleanliness" without acceptance criteria

### Required verification per round

- run typecheck or build for touched TS code
- if sync logic changes, add or update tests in the same round
- update the relevant `memory/` tracking note when the task is complete

## Suggested execution model

Use the following delivery rhythm:

1. pick one task group
2. implement only that group
3. run verification
4. write a short handoff summary
5. stop before moving to the next group

Do not combine all refactors into one giant PR.

## Task groups

The work is split into four groups.

Recommended order:

1. Group A: Shared contract extraction
2. Group B: Platform port convergence
3. Group C: Sync domain convergence
4. Group D: Renderer shell convergence

Groups A to C are the priority.

## Group A: Shared contract extraction

### Objective

Make `packages/shared` the real source of API-facing contract types.

### Problem to solve

Right now `packages/shared/src/agentdockApi.ts` imports from `packages/core/src/types/*`.

That means:

- `shared` is not independent
- contract drift is tied to domain changes
- future Tauri commands do not have a clean contract package

### Concrete change scope

Create a transport contract structure under:

```text
packages/shared/src/contract/
```

Recommended files:

```text
packages/shared/src/contract/assets.ts
packages/shared/src/contract/targets.ts
packages/shared/src/contract/applications.ts
packages/shared/src/contract/sync.ts
packages/shared/src/contract/scenarios.ts
packages/shared/src/contract/rules.ts
```

### What to move

Move only API-facing DTOs and input/output types.

Examples:

- `CreateAssetInput`
- `UpdateAssetInput`
- `AssetStatus`
- `TargetRecord`
- `SyncPreviewInput`
- `SyncPreviewResult`
- `ApplicationRecord`
- `ApplicationLocationRecord`

### What not to move yet

Do not blindly move everything from `core/src/types`.

Keep these as domain-local unless needed by transport:

- helper functions like `getAssetMainFileName`
- UI-only helper functions like severity color helpers
- internal-only domain composition types

### Files likely to touch

- `packages/shared/src/agentdockApi.ts`
- `packages/core/src/types/asset.ts`
- `packages/core/src/types/target.ts`
- `packages/core/src/types/application.ts`
- `packages/core/src/types/sync.ts`
- all imports in renderer/preload/main relying on old paths

### Recommended implementation pattern

Step 1:

- create `shared/src/contract/*`
- copy transport-safe types first

Step 2:

- update `agentdockApi.ts` to import only from `shared/src/contract/*`

Step 3:

- update renderer and preload imports to use `shared`

Step 4:

- if `core` still needs some shared DTOs, import them intentionally and minimally

### Acceptance criteria

- `packages/shared` has no imports from `packages/core`
- `agentdockApi.ts` is self-contained inside `shared`
- desktop preload compiles against `shared`
- renderer client compiles against `shared`

### Reviewer checklist

- [ ] no `../../core/src/...` imports remain inside `packages/shared`
- [ ] transport DTOs are grouped and named consistently
- [ ] helper functions were not incorrectly moved into `shared`

### Suggested execution prompt for another model

```text
Implement Group A from memory/tauri-refactor-task-breakdown-2026-06-11.md.
Goal: make packages/shared a true contract package with no imports from packages/core.
Only do Group A. Do not start port or sync refactors.
Run typecheck after changes and summarize touched files, risks, and any follow-up needed.
```

## Group B: Platform port convergence

### Objective

Freeze one canonical platform interface set that both Electron and Tauri can implement.

### Problem to solve

The TypeScript and Rust ports currently do not match.

This creates fake progress:

- Rust compiles
- but core services still cannot really run on the Rust-side interface

### Concrete design decision

Split responsibilities into these ports:

```text
FileSystemPort
PathPort
ShellPort
```

### Proposed interface responsibilities

`FileSystemPort`

- `exists`
- `readText`
- `writeText`
- `ensureDir`
- `copyDir`
- `emptyDir`
- `remove`

`PathPort`

- `join`
- `isAbsolute`
- `dirname`
- `basename`

`ShellPort`

- `commandExists`

### Why this split

`commandExists` is not really filesystem behavior.

Keeping it separate reduces confusion when Tauri/Rust implements ports later.

### Files likely to touch

- `packages/core/src/ports/fileSystemPort.ts`
- `packages/core/src/ports/pathPort.ts`
- add `packages/core/src/ports/shellPort.ts`
- `apps/desktop/src/platform/electron/fileSystemPort.ts`
- `apps/desktop/src/platform/electron/*`
- `apps/desktop/src-tauri/src/ports/file_system.rs`
- `apps/desktop/src-tauri/src/ports/mod.rs`
- any service constructors that currently rely on `commandExists` through file system

### Required service follow-up

`ApplicationService` currently uses `commandExists`.

That service should receive a `ShellPort` dependency instead of relying on `FileSystemPort` for shell checks.

### Recommended implementation pattern

Step 1:

- define `ShellPort` in `packages/core`

Step 2:

- update `ApplicationService` dependency signature

Step 3:

- update Electron implementations to provide both `FileSystemPort` and `ShellPort`

Step 4:

- update Rust port stubs to match exactly

Step 5:

- ensure no service depends on methods that exist only on one side

### Acceptance criteria

- TS core ports represent the single source of truth
- Electron implements the full canonical interface set
- Rust stubs match the same interface intent exactly
- `ApplicationService` no longer treats shell checks as filesystem checks

### Reviewer checklist

- [ ] `commandExists` moved out of `FileSystemPort`
- [ ] no duplicated or orphaned methods remain
- [ ] Rust side reflects the same contract shape
- [ ] service dependency injection remains explicit

### Suggested execution prompt for another model

```text
Implement Group B from memory/tauri-refactor-task-breakdown-2026-06-11.md.
Goal: converge platform ports and introduce a dedicated ShellPort.
Only do Group B. Do not change sync logic yet.
Update Electron and Rust port definitions to match the same canonical model.
Run typecheck and summarize any remaining interface drift.
```

## Group C: Sync domain convergence

### Objective

Remove duplicated sync logic and converge onto one planning and execution pipeline.

### Problem to solve

Right now sync behavior is split across:

- `SyncService`
- `ApplicationSyncService`

They repeat:

- asset filtering
- output path resolution
- AGENTS.md merge behavior
- write execution
- preview/result counting

They also already diverge semantically.

This is the highest-risk migration hotspot.

### First design decision

Pick the canonical Skill output directory identity now.

Recommendation:

```text
Use asset.id for output path identity
Use asset.name only for display
```

Reason:

- renames become safer
- sync tracking becomes stable
- snapshots and history remain durable

### Concrete change target

Introduce reusable sync building blocks under `packages/core/src/sync/`.

Recommended structure:

```text
packages/core/src/sync/syncPlanner.ts
packages/core/src/sync/syncExecutor.ts
packages/core/src/sync/syncDestination.ts
packages/core/src/sync/syncResultBuilders.ts
```

### Target architecture

```text
destination resolver
  -> normalized destinations
  -> sync planner
  -> sync plan
  -> sync executor
```

### Suggested responsibility split

`destination resolver`

- resolves Targets
- resolves Application Locations
- returns one normalized destination shape

`sync planner`

- validates scenario assets
- computes operations
- computes warnings
- computes create/update/merge/delete intent

`sync executor`

- reads asset content
- writes skill output
- merges AGENTS.md
- removes tracked output
- returns execution conflicts

### Files likely to touch

- `packages/core/src/sync/syncService.ts`
- `packages/core/src/application/applicationSyncService.ts`
- `packages/core/src/types/sync.ts`
- `packages/core/src/managed-block/mergeManagedBlock.ts`
- `packages/core/src/managed-block/removeManagedBlock.ts`

### Safe migration strategy

Do not rewrite both services at once.

Recommended approach:

Step 1:

- extract shared helper functions without changing service public APIs

Step 2:

- introduce normalized destination type

Step 3:

- migrate `SyncService` to use shared helpers

Step 4:

- migrate `ApplicationSyncService` to the same helpers

Step 5:

- only then consider renaming or collapsing service files

### Required tests in this group

At minimum add tests for:

- managed block append
- managed block update
- managed block conflict
- remove managed block success
- skill output path semantics
- preview plan counts

### Acceptance criteria

- one canonical rule for skill output path identity
- no duplicated AGENTS.md merge flow
- no duplicated sync preview counting logic
- both sync entry points rely on shared planner/executor helpers

### Reviewer checklist

- [ ] output path semantics are explicit and documented
- [ ] service APIs may remain separate, but shared core logic is centralized
- [ ] tests cover the extracted behavior
- [ ] no hidden behavior change slipped into sync output rules

### Suggested execution prompt for another model

```text
Implement Group C from memory/tauri-refactor-task-breakdown-2026-06-11.md.
Goal: converge SyncService and ApplicationSyncService onto shared sync building blocks without breaking public behavior.
Pick asset.id as the canonical Skill output path identity unless code evidence forces a safer transition step.
Add tests for managed block and sync plan behavior in the same round.
Stop after Group C and summarize remaining cleanup opportunities.
```

## Group D: Renderer shell convergence

### Objective

Hide Electron and Tauri runtime differences behind one client seam.

### Problem to solve

Renderer is mostly clean but still has direct shell awareness in places like `window.electron`.

### Concrete change target

Move shell-specific behavior under `agentdockClient` or a sibling shell bridge.

Possible structure:

```text
apps/desktop/src/renderer/client/
  agentdockClient.ts
  shellClient.ts
  runtime.ts
```

### Scope for this round

Only centralize shell-awareness.

Do not redesign all client APIs in this step.

### Files likely to touch

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/renderer/client/agentdockClient.ts`
- renderer type declarations
- preload bridge typings

### Recommended implementation pattern

Step 1:

- add runtime detection helper

Step 2:

- add shell action wrappers like `windowReady`

Step 3:

- replace direct `window.electron` usage in renderer

Step 4:

- keep fallback behavior for mock/dev mode

### Acceptance criteria

- renderer pages and `App.tsx` no longer call `window.electron` directly
- runtime branching happens in one place
- mock mode still works

### Reviewer checklist

- [ ] no new direct global access patterns were introduced
- [ ] shell behaviors are centralized
- [ ] renderer still works in mock mode

### Suggested execution prompt for another model

```text
Implement Group D from memory/tauri-refactor-task-breakdown-2026-06-11.md.
Goal: centralize Electron/Tauri shell awareness behind the renderer client boundary.
Do not redesign unrelated UI logic.
Run typecheck after changes and summarize remaining shell-specific globals, if any.
```

## Recommended round plan

Use these rounds.

### Round 1

Group A only.

Expected output:

- shared contract extracted
- imports updated
- no sync behavior changes

### Round 2

Group B only.

Expected output:

- canonical ports frozen
- Electron and Rust ports aligned at interface level

### Round 3

Group C only, part 1.

Expected output:

- shared sync helpers extracted
- tests added
- public APIs still intact

### Round 4

Group C only, part 2.

Expected output:

- duplicated logic reduced further
- output rules explicitly documented and stable

### Round 5

Group D only.

Expected output:

- renderer shell-awareness centralized

## What I should review after each round

After each execution round, I should review:

1. whether the intended boundary got cleaner
2. whether product behavior drifted
3. whether the change created hidden migration debt
4. whether the next round should proceed or stop for correction

## Required handoff format for the executing model

Ask the executing model to always return:

1. What was changed
2. Which files were touched
3. What was intentionally not changed
4. What verification was run
5. What risk or follow-up remains

## Definition of success

This task breakdown is succeeding if, after the next few rounds:

- migration work becomes additive instead of duplicative
- Electron and Tauri implementations can target the same core boundaries
- sync behavior has one source of truth
- renderer no longer cares which native shell is under it

## Next step

If delegating immediately, start with:

```text
Round 1 = Group A only
```

That is the safest and highest-leverage entry point.
