# AgentDock UI Replication Taskbook

Updated: 2026-06-05

This document tracks the gap between the design prototype in `docs/ui/agentdock-ui.html` and the current Electron/React implementation.

## Current Summary

The main product loop is now in place:

1. Create assets
2. Save into local registry
3. Configure scenarios and targets
4. Configure project-level Sync Matrix
5. Preview sync
6. Run sync
7. Sync assets to Agent-managed roots and project targets

What is done:

- Core navigation, modal, detail panel, and major pages are implemented
- Asset creation and editing are no longer placeholder-only
- Project creation, scenario linkage, and target management are usable
- Multi-agent management is wired through Settings
- Agent root path selection and manual asset sync are available
- Project-level `Sync Matrix / Preview / Run Sync` is available
- Project sync conflicts are now surfaced inline instead of only through toast feedback

What remains:

- Optional sync history, logs, or rollback UX
- More granular matrix controls if needed later
- Final UTF-8 cleanup of a few remaining renderer literals

## Completed Work

### P0

- [x] P0-1 New Asset Modal
  - Supports `skill / agents-md`
  - Supports title, id, description, initial content, template reset, preview
  - Opens the created asset automatically

- [x] P0-2 Detail Panel metadata + footer actions
  - Metadata fields restored
  - Footer actions unified
  - Asset delete flow implemented

- [x] P0-3 Text cleanup and mojibake fixes
  - Renderer-visible mojibake cleaned in key flows
  - Shared copy moved into `messages.ts`

### P1

- [x] P1-4 New Project Modal
  - Real project creation modal implemented
  - Supports name, path, default scenario, sync mode

- [x] P1-5 Dynamic Sidebar scenario / project injection
  - Sidebar scenarios and projects render from store data
  - Default scenario visual style normalized

- [x] P1-6 Scenario Agent / Project linkage
  - Scenario page can add enabled Agents
  - Linked projects are visible and navigable

- [x] P1-7 Install / Projects formalization
  - Install page is no longer a placeholder
  - Projects page became a real workflow page

### P2

- [x] P2-8 Unified Modal system
  - Shared modal structure and size variants standardized

- [x] P2-9 CSS warning cleanup
  - Recent `pnpm build` runs pass cleanly

- [x] P2-10 Inline style consolidation
  - Major page-level inline style debt reduced

- [x] P2-11 Interaction and accessibility polish
  - Keyboard activation and focus states improved for Settings and Scenarios
  - Overview now handles the no-enabled-Agent state explicitly

## Additional Work Completed After Initial Task Split

- [x] Settings preferences auto-persist
- [x] Window overlay/theme alignment fixes
- [x] Multi-agent catalog and real overview linkage
- [x] Manual Agent asset sync flow with managed `AGENTS.md` blocks
- [x] Native path picking for Settings-managed Agent roots
- [x] Project sync preview / run workflow
- [x] Project-level Sync Matrix target selection
- [x] Overview filtered to enabled Agents only
- [x] Agent managed paths normalized to workspace root instead of saving the nested `skills` path
- [x] Target path native directory picker
- [x] Project path native directory picker
- [x] Keyboard and focus polish for Settings / Scenarios / Overview
- [x] Inline conflict presentation for project sync results

## Remaining Recommended Tasks

### R1. Sync History

Recommended next:

- Add sync result history or lightweight logs
- Optionally attach rollback hints to the last sync run

### R2. Matrix Refinement

Recommended next:

- Add more granular matrix controls if the product needs asset-level target selection later
- Consider persisting richer preview metadata per project

### R3. UTF-8 Cleanup

Recommended next:

- Revisit remaining mojibake-prone literals and ensure full UTF-8 cleanliness
- Continue polishing Agent root editing labels and guidance text

## Latest Progress Notes

- The project no longer syncs blindly to all enabled targets by default
- Each project now owns a real `Sync Matrix` target selection
- Agent Settings now store a workspace root and derive `skills / AGENTS.md` from it
- Overview now reflects only enabled Agents, which matches expected product behavior
- Keyboard activation and focus states now cover the main Settings and Scenario selection flows
- Project sync conflicts now stay visible in the workflow panel with asset, target, reason, and output path context

## Definition of "Main Loop Complete"

For the current prototype phase, the main loop is considered complete when:

- Assets can be created and edited
- Scenarios can bundle assets and Agents
- Targets can be configured
- Projects can choose targets via Sync Matrix
- Sync can be previewed and executed
- Agent-managed roots can receive synced assets

That bar is now effectively met.

## Suggested Next Finish Line

If we want to call the taskbook "fully complete", the next finish line should be:

1. Add sync result history or lightweight logs
2. Run `pnpm build` again
3. Finish the remaining UTF-8 cleanup
4. Mark the document complete
