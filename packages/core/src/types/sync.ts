/**
 * Domain types for sync.
 *
 * The transport-stable DTO definitions live in
 * `@agentdock/shared/contract/sync`. This module re-exports them so internal
 * core consumers can continue to import from `../types/sync` without churn.
 */

export type {
    SyncOperationKind,
    SyncPlanItem,
    SyncInlineTarget,
    SyncRunConflict,
    SyncHistoryStatus,
    SyncHistoryOutput,
    SyncHistoryEntry,
    SyncPreviewInput,
    SyncCleanupInput,
    SyncPreviewResult,
    SyncRunResult,
    SyncCleanupResult,
} from "@agentdock/shared/contract/sync";
