/**
 * Transport contract types for asset snapshots.
 */

export type SnapshotRecord = {
    id: string;
    asset_id: string;
    snapshot_path: string;
    message: string;
    created_at: string;
};