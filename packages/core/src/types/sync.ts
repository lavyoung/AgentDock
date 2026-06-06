import type {AssetType} from "./asset";

export type SyncOperationKind = "create" | "update" | "merge" | "delete";

export type SyncPlanItem = {
    asset_id: string;
    asset_name: string;
    asset_type: AssetType;
    target_id: string;
    target_name: string;
    target_root: string;
    output_path: string;
    operation: SyncOperationKind;
};

export type SyncInlineTarget = {
    id: string;
    name: string;
    path: string;
    deployMode: "copy" | "merge";
};

export type SyncRunConflict = {
    asset_id: string;
    asset_name: string;
    asset_type: AssetType;
    target_id: string;
    target_name: string;
    output_path: string;
    reason: string;
};

export type SyncHistoryStatus = "success" | "warning" | "conflict";

export type SyncHistoryOutput = {
    asset_id: string;
    asset_name: string;
    asset_type: AssetType;
    target_id: string;
    target_name: string;
    output_path: string;
    operation: SyncOperationKind;
};

export type SyncPreviewInput = {
    scenario_id: string;
    target_ids?: string[];
    inline_targets?: SyncInlineTarget[];
    tracked_outputs?: SyncHistoryOutput[];
};

export type SyncCleanupInput = {
    tracked_outputs: SyncHistoryOutput[];
};

export type SyncPreviewResult = {
    scenario_id: string;
    target_count: number;
    operation_count: number;
    create_count: number;
    update_count: number;
    merge_count: number;
    delete_count: number;
    warnings: string[];
    items: SyncPlanItem[];
};

export type SyncHistoryEntry = {
    id: string;
    scenario_id: string;
    synced_at: string;
    target_count: number;
    operation_count: number;
    written_count: number;
    warning_count: number;
    conflict_count: number;
    status: SyncHistoryStatus;
    warnings: string[];
    conflicts: SyncRunConflict[];
    outputs: SyncHistoryOutput[];
};

export type SyncRunResult = SyncPreviewResult & {
    written_count: number;
    conflicts: SyncRunConflict[];
    synced_at: string;
};

export type SyncCleanupResult = {
    cleaned_count: number;
    conflict_count: number;
    warnings: string[];
    conflicts: SyncRunConflict[];
    cleaned_at: string;
};
