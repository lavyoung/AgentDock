import type {AssetDetail, AssetRecord, CreateAssetInput, UpdateAssetInput,} from "../core/types/asset";
import type {SnapshotRecord} from "../core/types/snapshot";

export interface AgentdockApi {
    app: {
        name: string;
    };
    assets: {
        list(): Promise<AssetRecord[]>;
        get(id: string): Promise<AssetDetail | null>;
        create(input: CreateAssetInput): Promise<AssetRecord>;
        update(id: string, input: UpdateAssetInput): Promise<AssetDetail | null>;
    };
    snapshots: {
        list(assetId: string): Promise<SnapshotRecord[]>;
        restore(snapshotId: string): Promise<{
            restored: true;
            asset_id: string;
            snapshot_id: string;
        }>;
    };
}
