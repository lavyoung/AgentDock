import type {SnapshotRecord} from "../types/snapshot";

export interface SnapshotRepository {
    listByAssetId(assetId: string): SnapshotRecord[];
    findById(id: string): SnapshotRecord | null;
    create(snapshot: SnapshotRecord): void;
}
