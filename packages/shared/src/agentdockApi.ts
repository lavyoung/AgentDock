import type {
    ApplicationDetail,
    ApplicationLocationRecord,
    ApplicationRecord,
    UpdateApplicationInput,
    UpdateApplicationLocationInput,
} from "../../core/src/types/application";
import type {AssetDetail, AssetRecord, CreateAssetInput, UpdateAssetInput,} from "../../core/src/types/asset";
import type {SnapshotRecord} from "../../core/src/types/snapshot";
import type {CreateTargetInput, TargetRecord, UpdateTargetInput,} from "../../core/src/types/target";

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
    applications: {
        list(): Promise<ApplicationRecord[]>;
        get(id: "codex"): Promise<ApplicationDetail | null>;
        update(id: "codex", input: UpdateApplicationInput): Promise<ApplicationRecord>;
        refreshLocations(id: "codex"): Promise<ApplicationLocationRecord[]>;
        updateLocation(
            id: string,
            input: UpdateApplicationLocationInput
        ): Promise<ApplicationLocationRecord>;
    };
}
