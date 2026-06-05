import {type AssetRecord, getAssetMainFileName, type ScenarioRecord} from "../types/asset";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import {mergeManagedBlock} from "../managed-block/mergeManagedBlock";
import type {ScenarioRepository} from "../scenario/scenarioRepository";
import type {TargetRepository} from "../target/targetRepository";
import type {TargetRecord} from "../types/target";
import type {AssetRepository} from "../asset/assetRepository";
import type {
    SyncInlineTarget,
    SyncPlanItem,
    SyncPreviewInput,
    SyncPreviewResult,
    SyncRunConflict,
    SyncRunResult,
} from "../types/sync";

type ResolvedSyncTarget = Pick<TargetRecord, "id" | "name" | "path" | "deployMode" | "enabled">;

type SyncServiceDependencies = {
    scenarioRepository: ScenarioRepository;
    assetRepository: AssetRepository;
    targetRepository: TargetRepository;
    fileSystem: FileSystemPort;
    path: PathPort;
};

type PreparedPlan = {
    scenario: ScenarioRecord;
    targets: ResolvedSyncTarget[];
    assetsById: Map<string, AssetRecord>;
    warnings: string[];
    items: SyncPlanItem[];
};

export class SyncService {
    private readonly scenarioRepository: ScenarioRepository;
    private readonly assetRepository: AssetRepository;
    private readonly targetRepository: TargetRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;

    constructor(dependencies: SyncServiceDependencies) {
        this.scenarioRepository = dependencies.scenarioRepository;
        this.assetRepository = dependencies.assetRepository;
        this.targetRepository = dependencies.targetRepository;
        this.fileSystem = dependencies.fileSystem;
        this.path = dependencies.path;
    }

    async previewScenarioSync(input: SyncPreviewInput): Promise<SyncPreviewResult> {
        const prepared = await this.preparePlan(input);
        return this.toPreviewResult(prepared);
    }

    async runScenarioSync(input: SyncPreviewInput): Promise<SyncRunResult> {
        const prepared = await this.preparePlan(input);
        const conflicts: SyncRunConflict[] = [];
        let writtenCount = 0;

        for (const item of prepared.items) {
            const asset = prepared.assetsById.get(item.asset_id);
            const target = prepared.targets.find((candidate) => candidate.id === item.target_id);

            if (!asset || !target) {
                continue;
            }

            if (asset.type === "skill") {
                await this.writeSkillAsset(target, asset);
                writtenCount += 1;
                continue;
            }

            if (asset.type === "agents-md") {
                const merged = await this.writeAgentsMdAsset(item.output_path, asset);

                if (merged.status === "conflict") {
                    conflicts.push({
                        asset_id: asset.id,
                        asset_name: asset.title || asset.name,
                        asset_type: asset.type,
                        target_id: target.id,
                        target_name: target.name,
                        output_path: item.output_path,
                        reason: merged.reason,
                    });
                    continue;
                }

                writtenCount += 1;
            }
        }

        return {
            ...this.toPreviewResult(prepared),
            written_count: writtenCount,
            conflicts,
            synced_at: new Date().toISOString(),
        };
    }

    private async preparePlan(input: SyncPreviewInput): Promise<PreparedPlan> {
        const scenario = this.scenarioRepository.findById(input.scenario_id);

        if (!scenario) {
            throw new Error(`Scenario not found: ${input.scenario_id}`);
        }

        const allTargets = this.targetRepository.list().filter((target) => target.enabled);
        const selectedTargetIds = input.target_ids;
        const selectedTargets = selectedTargetIds === undefined
            ? allTargets
            : allTargets.filter((target) => selectedTargetIds.includes(target.id));
        const inlineTargets = (input.inline_targets ?? []).map((target) => this.toResolvedTarget(target));
        const targets = [...selectedTargets, ...inlineTargets].filter(
            (target, index, list) => list.findIndex((candidate) => candidate.id === target.id) === index
        );
        const warnings: string[] = [];

        if (targets.length === 0) {
            warnings.push("No sync destinations are available for this scenario.");
        }

        const assets = this.assetRepository.list();
        const assetsById = new Map<string, AssetRecord>();
        const skillAssets = this.collectScenarioAssets(
            scenario.skillIds,
            "skill",
            scenario,
            assetsById,
            warnings,
            assets
        );
        const agentsMdAssets = this.collectScenarioAssets(
            scenario.agentFileIds,
            "agents-md",
            scenario,
            assetsById,
            warnings,
            assets
        );
        const items: SyncPlanItem[] = [];

        if (skillAssets.length === 0 && agentsMdAssets.length === 0) {
            warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync.`);
        }

        for (const target of targets) {
            for (const asset of skillAssets) {
                const outputPath = this.path.join(
                    target.path,
                    "skills",
                    asset.id,
                    getAssetMainFileName(asset.type)
                );
                items.push({
                    asset_id: asset.id,
                    asset_name: asset.title || asset.name,
                    asset_type: asset.type,
                    target_id: target.id,
                    target_name: target.name,
                    target_root: target.path,
                    output_path: outputPath,
                    operation: (await this.fileSystem.exists(outputPath)) ? "update" : "create",
                });
            }

            for (const asset of agentsMdAssets) {
                const outputPath = this.path.join(target.path, "AGENTS.md");
                const targetExists = await this.fileSystem.exists(outputPath);
                items.push({
                    asset_id: asset.id,
                    asset_name: asset.title || asset.name,
                    asset_type: asset.type,
                    target_id: target.id,
                    target_name: target.name,
                    target_root: target.path,
                    output_path: outputPath,
                    operation: targetExists ? "merge" : "create",
                });
            }
        }

        return {
            scenario,
            targets,
            assetsById,
            warnings,
            items,
        };
    }

    private collectScenarioAssets(
        assetIds: string[],
        assetType: AssetRecord["type"],
        scenario: ScenarioRecord,
        assetsById: Map<string, AssetRecord>,
        warnings: string[],
        assets: AssetRecord[]
    ): AssetRecord[] {
        const collected: AssetRecord[] = [];

        for (const assetId of assetIds) {
            const asset = assets.find((candidate) => candidate.id === assetId);

            if (!asset) {
                warnings.push(`Scenario "${scenario.title}" references a missing asset: ${assetId}`);
                continue;
            }

            if (asset.type !== assetType) {
                warnings.push(`Asset "${asset.title || asset.name}" is not a ${assetType} asset and was skipped.`);
                continue;
            }

            if (asset.status !== "active") {
                warnings.push(`Disabled asset "${asset.title || asset.name}" was skipped during sync preview.`);
                continue;
            }

            assetsById.set(asset.id, asset);
            collected.push(asset);
        }

        return collected;
    }

    private toResolvedTarget(target: SyncInlineTarget): ResolvedSyncTarget {
        return {
            id: target.id,
            name: target.name,
            path: target.path,
            deployMode: target.deployMode,
            enabled: true,
        };
    }

    private toPreviewResult(prepared: PreparedPlan): SyncPreviewResult {
        const createCount = prepared.items.filter((item) => item.operation === "create").length;
        const updateCount = prepared.items.filter((item) => item.operation === "update").length;
        const mergeCount = prepared.items.filter((item) => item.operation === "merge").length;

        return {
            scenario_id: prepared.scenario.id,
            target_count: prepared.targets.length,
            operation_count: prepared.items.length,
            create_count: createCount,
            update_count: updateCount,
            merge_count: mergeCount,
            warnings: prepared.warnings,
            items: prepared.items,
        };
    }

    private async writeSkillAsset(target: ResolvedSyncTarget, asset: AssetRecord): Promise<void> {
        const content = await this.readAssetContent(asset);
        const assetDir = this.path.join(target.path, "skills", asset.id);
        await this.fileSystem.ensureDir(assetDir);
        await this.fileSystem.writeText(
            this.path.join(assetDir, getAssetMainFileName(asset.type)),
            content
        );
    }

    private async writeAgentsMdAsset(
        outputPath: string,
        asset: AssetRecord
    ): Promise<{status: "ok"; content: string} | {status: "conflict"; reason: string}> {
        const originalContent = (await this.fileSystem.exists(outputPath))
            ? await this.fileSystem.readText(outputPath)
            : "";
        const content = await this.readAssetContent(asset);
        const merged = mergeManagedBlock({
            originalContent,
            assetId: asset.id,
            version: asset.version,
            generatedContent: content,
        });

        if (merged.status === "conflict") {
            return {
                status: "conflict",
                reason: merged.reason,
            };
        }

        await this.fileSystem.writeText(outputPath, merged.content);
        return {
            status: "ok",
            content: merged.content,
        };
    }

    private readAssetContent(asset: AssetRecord): Promise<string> {
        return this.fileSystem.readText(
            this.path.join(asset.path, "current", getAssetMainFileName(asset.type))
        );
    }
}
