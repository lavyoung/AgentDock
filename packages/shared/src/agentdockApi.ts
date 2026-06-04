import type {
    ApplicationDetail,
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationRecord,
    ApplicationSyncResult,
    UpdateApplicationInput,
    UpdateApplicationLocationInput,
} from "../../core/src/types/application";
import type {
    AssetDetail,
    AssetRecord,
    AssetStatus,
    CreateAssetInput,
    RuleRecord,
    ScenarioRecord,
    UpdateAssetInput,
} from "../../core/src/types/asset";
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
        setStatus(id: string, status: AssetStatus): Promise<AssetRecord | null>;
        delete(id: string): Promise<{deleted: true; asset_id: string}>;
    };
    rules: {
        list(): Promise<RuleRecord[]>;
        get(id: string): Promise<RuleRecord | null>;
        create(input: {name: string; title?: string; description?: string; severity: RuleRecord["severity"]; enabled?: boolean}): Promise<RuleRecord>;
        update(id: string, input: Partial<RuleRecord>): Promise<RuleRecord>;
        delete(id: string): Promise<{deleted: true; rule_id: string}>;
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
    scenarios: {
        list(): Promise<ScenarioRecord[]>;
        get(id: string): Promise<ScenarioRecord | null>;
        create(input: {name: string; title?: string; description?: string}): Promise<ScenarioRecord>;
        update(id: string, input: Partial<ScenarioRecord>): Promise<ScenarioRecord>;
        delete(id: string): Promise<{deleted: true; scenario_id: string}>;
        addAsset(scenarioId: string, field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;
        removeAsset(scenarioId: string, field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;
    };
    applications: {
        list(): Promise<ApplicationRecord[]>;
        get(id: ApplicationId): Promise<ApplicationDetail | null>;
        update(id: ApplicationId, input: UpdateApplicationInput): Promise<ApplicationRecord>;
        refreshLocations(id: ApplicationId): Promise<ApplicationLocationRecord[]>;
        updateLocation(
            id: string,
            input: UpdateApplicationLocationInput
        ): Promise<ApplicationLocationRecord>;
        runSync(id: ApplicationId): Promise<ApplicationSyncResult>;
    };
}
