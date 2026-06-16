/**
 * Domain types for asset snapshots.
 *
 * The transport-stable DTO definition lives in
 * `@agentdock/shared/contract/snapshots`. This module re-exports it so internal
 * core consumers can continue to import from `../types/snapshot` without
 * churn.
 */

export type {SnapshotRecord} from "@agentdock/shared/contract/snapshots";
