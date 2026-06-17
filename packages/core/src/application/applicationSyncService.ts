import type {AssetRepository} from "../asset/assetRepository";
import type {AssetRecord} from "../types/asset";
import type {ScenarioRepository} from "../scenario/scenarioRepository";
import type {
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationSyncConflict,
    ApplicationSyncResult,
} from "../types/application";
import type {ApplicationRepository} from "./applicationRepository";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {SyncPlanItem, SyncPreviewResult, SyncRunConflict, SyncRunResult} from "../types/sync";
import {
    collectScenarioAssets,
    resolveManagedPath,
    resolveSkillOutputPath,
} from "../sync/syncPlannerHelpers";
import {
    writeAgentsMdMerge,
    writeAgentsMdMerges,
    writeSkillOutput,
} from "../sync/syncExecutorHelpers";
import {
    buildApplicationSyncConflict,
    buildPreviewResult,
    buildSyncRunConflict,
} from "../sync/syncResultBuilders";

type ApplicationSyncServiceDependencies = {
    applicationRepository: ApplicationRepository;
    scenarioRepository: ScenarioRepository;
    assetRepository: AssetRepository;
    fileSystem: FileSystemPort;
    path: PathPort;
};

export class ApplicationSyncService {
    private readonly applicationRepository: ApplicationRepository;
    private readonly scenarioRepository: ScenarioRepository;
    private readonly assetRepository: AssetRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;

    constructor(dependencies: ApplicationSyncServiceDependencies) {
        this.applicationRepository = dependencies.applicationRepository;
        this.scenarioRepository = dependencies.scenarioRepository;
        this.assetRepository = dependencies.assetRepository;
        this.fileSystem = dependencies.fileSystem;
        this.path = dependencies.path;
    }

    async syncApplication(applicationId: ApplicationId): Promise<ApplicationSyncResult> {
        const enabledLocations = this.applicationRepository
            .listLocations(applicationId)
            .filter((location) => location.enabled);
        const activeAssets = this.assetRepository
            .list()
            .filter((asset) => asset.status === "active");
        const skillAssets = activeAssets.filter((asset) => asset.type === "skill");
        const agentsMdAssets = activeAssets.filter((asset) => asset.type === "agents-md");
        const conflicts: ApplicationSyncConflict[] = [];
        let syncedSkills = 0;
        let syncedAgentsMd = 0;
        let touchedLocations = 0;

        for (const location of enabledLocations) {
            const wroteSomething =
                location.kind === "skills"
                    ? await this.syncSkillLocation(location, skillAssets)
                    : await this.syncAgentsMdLocation(location, agentsMdAssets, conflicts);

            if (wroteSomething) {
                touchedLocations += 1;
                if (location.kind === "skills") {
                    syncedSkills += skillAssets.length;
                } else {
                    syncedAgentsMd += agentsMdAssets.length;
                }
            }
        }

        return {
            application_id: applicationId,
            synced_skills: syncedSkills,
            synced_agents_md: syncedAgentsMd,
            touched_locations: touchedLocations,
            conflicts,
            synced_at: new Date().toISOString(),
        };
    }

    async previewScenarioSync(
        applicationId: ApplicationId,
        scenarioId: string
    ): Promise<SyncPreviewResult> {
        const prepared = await this.prepareScenarioPlan(applicationId, scenarioId);
        return buildPreviewResult({
            scenarioId,
            targetCount: prepared.locations.length,
            items: prepared.items,
            warnings: prepared.warnings,
        });
    }

    async runScenarioSync(
        applicationId: ApplicationId,
        scenarioId: string
    ): Promise<SyncRunResult> {
        const prepared = await this.prepareScenarioPlan(applicationId, scenarioId);
        const conflicts: SyncRunConflict[] = [];
        let writtenCount = 0;

        for (const item of prepared.items) {
            const asset = prepared.assetsById.get(item.asset_id);
            const location = prepared.locations.find((candidate) => candidate.id === item.target_id);

            if (!asset || !location) {
                continue;
            }

            if (asset.type === "skill") {
                await writeSkillOutput(this.fileSystem, this.path, location.path, asset);
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
                            target: {id: location.id, name: location.name},
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
            ...buildPreviewResult({
                scenarioId,
                targetCount: prepared.locations.length,
                items: prepared.items,
                warnings: prepared.warnings,
            }),
            written_count: writtenCount,
            conflicts,
            synced_at: new Date().toISOString(),
        };
    }

    private async prepareScenarioPlan(
        applicationId: ApplicationId,
        scenarioId: string
    ): Promise<{
        locations: ApplicationLocationRecord[];
        warnings: string[];
        items: SyncPlanItem[];
        assetsById: Map<string, AssetRecord>;
    }> {
        const scenario = this.scenarioRepository.findById(scenarioId);

        if (!scenario) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        const locations = this.applicationRepository
            .listLocations(applicationId)
            .filter((location) => location.enabled);
        const warnings: string[] = [];

        if (locations.length === 0) {
            warnings.push(`No enabled managed locations are configured for ${applicationId}.`);
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
            warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync to Agent locations.`);
        }

        const items: SyncPlanItem[] = [];

        for (const location of locations) {
            if (location.kind === "skills") {
                for (const asset of skillAssets) {
                    const outputPath = resolveSkillOutputPath(this.path, location.path, asset);
                    items.push({
                        asset_id: asset.id,
                        asset_name: asset.title || asset.name,
                        asset_type: asset.type,
                        target_id: location.id,
                        target_name: location.name,
                        target_root: location.path,
                        output_path: outputPath,
                        operation: (await this.fileSystem.exists(outputPath)) ? "update" : "create",
                    });
                }
            }

            if (location.kind === "agents-md") {
                const outputPath = resolveManagedPath(this.path, location);
                const outputExists = await this.fileSystem.exists(outputPath);
                for (const asset of agentsMdAssets) {
                    items.push({
                        asset_id: asset.id,
                        asset_name: asset.title || asset.name,
                        asset_type: asset.type,
                        target_id: location.id,
                        target_name: location.name,
                        target_root: location.path,
                        output_path: outputPath,
                        operation: outputExists ? "merge" : "create",
                    });
                }
            }
        }

        return {
            locations,
            warnings,
            items,
            assetsById,
        };
    }

    private async syncSkillLocation(
        location: ApplicationLocationRecord,
        assets: AssetRecord[]
    ): Promise<boolean> {
        if (assets.length === 0) {
            return false;
        }

        const skillsRoot = resolveManagedPath(this.path, location);
        await this.fileSystem.ensureDir(skillsRoot);

        for (const asset of assets) {
            await writeSkillOutput(this.fileSystem, this.path, location.path, asset);
        }

        return true;
    }

    private async syncAgentsMdLocation(
        location: ApplicationLocationRecord,
        assets: AssetRecord[],
        conflicts: ApplicationSyncConflict[]
    ): Promise<boolean> {
        if (assets.length === 0) {
            return false;
        }

        const agentsMdPath = resolveManagedPath(this.path, location);
        await this.fileSystem.ensureDir(location.path);
        const merged = await writeAgentsMdMerges(
            this.fileSystem,
            this.path,
            agentsMdPath,
            assets
        );

        if (merged.status === "conflict") {
            conflicts.push(
                buildApplicationSyncConflict({
                    asset: {id: merged.assetId},
                    location: {id: location.id, name: location.name},
                    reason: merged.reason,
                })
            );
            return false;
        }

        return true;
    }
}
