import type {AssetRecord, ScenarioRecord} from "../types/asset";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {ScenarioRepository} from "../scenario/scenarioRepository";
import type {TargetRepository} from "../target/targetRepository";
import type {TargetRecord} from "../types/target";
import type {AssetRepository} from "../asset/assetRepository";
import type {
    SyncCleanupInput,
    SyncCleanupResult,
    SyncHistoryOutput,
    SyncInlineTarget,
    SyncPlanItem,
    SyncPreviewInput,
    SyncPreviewResult,
    SyncRunConflict,
    SyncRunResult,
} from "../types/sync";
import {
    collectScenarioAssets,
    diffTrackedOutputs,
    resolveAgentsMdOutputPath,
    resolveSkillOutputPath,
} from "./syncPlannerHelpers";
import {
    removeAgentsMdBlock,
    removeSkillOutput,
    writeAgentsMdMerge,
    writeSkillOutput,
} from "./syncExecutorHelpers";
import {buildPreviewResult, buildSyncRunConflict} from "./syncResultBuilders";

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
            if (item.operation === "delete") {
                const removal = await this.removeSyncedOutput(item);

                if (removal.status === "conflict") {
                    conflicts.push({
                        asset_id: item.asset_id,
                        asset_name: item.asset_name,
                        asset_type: item.asset_type,
                        target_id: item.target_id,
                        target_name: item.target_name,
                        output_path: item.output_path,
                        reason: removal.reason,
                    });
                    continue;
                }

                writtenCount += 1;
                continue;
            }

            const asset = prepared.assetsById.get(item.asset_id);
            const target = prepared.targets.find((candidate) => candidate.id === item.target_id);

            if (!asset || !target) {
                continue;
            }

            if (asset.type === "skill") {
                await writeSkillOutput(this.fileSystem, this.path, target.path, asset);
                writtenCount += 1;
                continue;
            }

            if (asset.type === "agents-md") {
                const merged = await writeAgentsMdMerge(
                    this.fileSystem,
                    this.path,
                    item.output_path,
                    asset
                );

                if (merged.status === "conflict") {
                    conflicts.push(
                        buildSyncRunConflict({
                            item,
                            target,
                            reason: merged.reason,
                            assetName: asset.title || asset.name,
                        })
                    );
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

    async cleanupTrackedOutputs(input: SyncCleanupInput): Promise<SyncCleanupResult> {
        const conflicts: SyncRunConflict[] = [];
        const warnings: string[] = [];
        let cleanedCount = 0;

        for (const output of input.tracked_outputs) {
            const removal = await this.removeSyncedOutput({
                ...output,
                target_root: this.path.dirname(output.output_path),
                operation: "delete",
            });

            if (removal.status === "conflict") {
                conflicts.push({
                    asset_id: output.asset_id,
                    asset_name: output.asset_name,
                    asset_type: output.asset_type,
                    target_id: output.target_id,
                    target_name: output.target_name,
                    output_path: output.output_path,
                    reason: removal.reason,
                });
                continue;
            }

            cleanedCount += 1;
        }

        if (input.tracked_outputs.length === 0) {
            warnings.push("No tracked outputs were available to clean.");
        }

        return {
            cleaned_count: cleanedCount,
            conflict_count: conflicts.length,
            warnings,
            conflicts,
            cleaned_at: new Date().toISOString(),
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

        const allAssets = this.assetRepository.list();
        const skillCollection = collectScenarioAssets({
            scenario,
            allAssets,
            expectedType: "skill",
            assetIdList: scenario.skillIds,
        });
        const agentsCollection = collectScenarioAssets({
            scenario,
            allAssets,
            expectedType: "agents-md",
            assetIdList: scenario.agentFileIds,
        });
        const skillAssets = skillCollection.assets;
        const agentsMdAssets = agentsCollection.assets;
        const assetsById = new Map<string, AssetRecord>([
            ...skillCollection.assetsById,
            ...agentsCollection.assetsById,
        ]);
        warnings.push(...skillCollection.warnings, ...agentsCollection.warnings);

        if (skillAssets.length === 0 && agentsMdAssets.length === 0) {
            warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync.`);
        }

        const items: SyncPlanItem[] = [];

        for (const target of targets) {
            for (const asset of skillAssets) {
                const outputPath = resolveSkillOutputPath(this.path, target.path, asset);
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
                const outputPath = resolveAgentsMdOutputPath(this.path, target.path);
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

        const currentItemKeys = new Set(items.map((item) => this.getPlanItemKey(item)));
        const deleteItems = diffTrackedOutputs(
            this.path,
            input.tracked_outputs ?? [],
            currentItemKeys
        );
        items.push(...deleteItems);

        return {
            scenario,
            targets,
            assetsById,
            warnings,
            items,
        };
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
        return buildPreviewResult({
            scenarioId: prepared.scenario.id,
            targetCount: prepared.targets.length,
            items: prepared.items,
            warnings: prepared.warnings,
        });
    }

    private async removeSyncedOutput(
        item: SyncPlanItem
    ): Promise<{status: "ok"} | {status: "conflict"; reason: string}> {
        if (item.asset_type === "skill") {
            await removeSkillOutput(this.fileSystem, this.path, item.output_path);
            return {status: "ok"};
        }

        if (item.asset_type === "agents-md") {
            return removeAgentsMdBlock(this.fileSystem, item.output_path, item.asset_id);
        }

        return {status: "ok"};
    }

    private getPlanItemKey(item: SyncPlanItem): string {
        return `${item.target_id}:${item.asset_id}:${item.output_path}`;
    }

    /**
     * Kept as a thin alias so the historical output key shape is preserved
     * for any future direct comparison. The new shared `historyOutputKey`
     * produces the same string and is what the planner uses.
     */
    private getHistoryOutputKey(output: SyncHistoryOutput): string {
        return `${output.target_id}:${output.asset_id}:${output.output_path}`;
    }
}
