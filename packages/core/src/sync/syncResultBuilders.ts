/**
 * Result / preview builders for the sync domain.
 *
 * The two sync services both produce the same shape of `SyncPreviewResult`
 * and the same shape of `SyncRunConflict`. The shared builders here let
 * each service construct those values without re-implementing the
 * `items.filter(...).length` counting dance.
 *
 * The builders do not perform I/O and do not read from the file system —
 * they only shape already-prepared data.
 */

import type {ApplicationLocationRecord, ApplicationSyncConflict} from "../types/application";
import type {
    SyncPlanItem,
    SyncPreviewResult,
    SyncRunConflict,
    SyncOperationKind,
} from "../types/sync";

/**
 * Operation-kind counts derived from a list of plan items.
 */
export type OperationCounts = {
    create: number;
    update: number;
    merge: number;
    delete: number;
};

/**
 * Compute create/update/merge/delete counts from a list of plan items.
 *
 * Used by both `SyncService.toPreviewResult` and the equivalent path in
 * `ApplicationSyncService.toScenarioPreviewResult`.
 */
export function countOperations(items: SyncPlanItem[]): OperationCounts {
    const counts: Record<SyncOperationKind, number> = {
        create: 0,
        update: 0,
        merge: 0,
        delete: 0,
    };

    for (const item of items) {
        counts[item.operation] += 1;
    }

    return {
        create: counts.create,
        update: counts.update,
        merge: counts.merge,
        delete: counts.delete,
    };
}

type BuildPreviewResultInput = {
    scenarioId: string;
    targetCount: number;
    items: SyncPlanItem[];
    warnings: string[];
};

/**
 * Build a `SyncPreviewResult` from prepared plan data.
 *
 * Centralises the count / target / warning shape. The `application`-side
 * preview uses the same builder, passing its `locations.length` as the
 * `targetCount`.
 */
export function buildPreviewResult(input: BuildPreviewResultInput): SyncPreviewResult {
    const counts = countOperations(input.items);

    return {
        scenario_id: input.scenarioId,
        target_count: input.targetCount,
        operation_count: input.items.length,
        create_count: counts.create,
        update_count: counts.update,
        merge_count: counts.merge,
        delete_count: counts.delete,
        warnings: input.warnings,
        items: input.items,
    };
}

type BuildSyncRunConflictInput = {
    item: Pick<SyncPlanItem, "asset_id" | "asset_name" | "asset_type" | "output_path">;
    target: {id: string; name: string};
    reason: string;
    /**
     * Optional override for the displayed asset name. Defaults to
     * `item.asset_name`.
     */
    assetName?: string;
};

/**
 * Build a single `SyncRunConflict` from a plan item, target, and reason.
 *
 * Used by both services to report AGENTS.md merge failures during
 * `runScenarioSync`.
 */
export function buildSyncRunConflict(input: BuildSyncRunConflictInput): SyncRunConflict {
    return {
        asset_id: input.item.asset_id,
        asset_name: input.assetName ?? input.item.asset_name,
        asset_type: input.item.asset_type,
        target_id: input.target.id,
        target_name: input.target.name,
        output_path: input.item.output_path,
        reason: input.reason,
    };
}

type BuildApplicationSyncConflictInput = {
    asset: {id: string};
    location: Pick<ApplicationLocationRecord, "id" | "name">;
    reason: string;
};

/**
 * Build an `ApplicationSyncConflict`. Used by
 * `ApplicationSyncService.syncApplication` when an AGENTS.md merge fails
 * inside a managed location.
 */
export function buildApplicationSyncConflict(
    input: BuildApplicationSyncConflictInput
): ApplicationSyncConflict {
    return {
        asset_id: input.asset.id,
        location_id: input.location.id,
        reason: input.reason,
    };
}
