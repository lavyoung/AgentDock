import type {AssetDetail, AssetRecord, CreateAssetInput, UpdateAssetInput,} from "../core/types/asset";
import type {SnapshotRecord} from "../core/types/snapshot";
import type {CreateTargetInput, TargetRecord, UpdateTargetInput,} from "../core/types/target";

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
    targets: {
        list(): Promise<TargetRecord[]>;
        get(id: string): Promise<TargetRecord | null>;
        create(input: CreateTargetInput): Promise<TargetRecord>;
        update(id: string, input: UpdateTargetInput): Promise<TargetRecord>;
        delete(id: string): Promise<{deleted: true; target_id: string}>;
    };
}
