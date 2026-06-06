import type {AssetRepository} from "../asset/assetRepository";
import {type AssetRecord, getAssetMainFileName} from "../types/asset";
import type {ScenarioRepository} from "../scenario/scenarioRepository";
import type {
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationSyncConflict,
    ApplicationSyncResult,
} from "../types/application";
import {mergeManagedBlock} from "../managed-block/mergeManagedBlock";
import type {ApplicationRepository} from "./applicationRepository";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {SyncPreviewResult, SyncRunConflict, SyncRunResult} from "../types/sync";

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
        return this.toScenarioPreviewResult(scenarioId, prepared.locations, prepared.warnings, prepared.items);
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
                await this.writeSkillToLocation(location, asset);
                writtenCount += 1;
                continue;
            }

            if (asset.type === "agents-md") {
                const merged = await this.writeAgentsMdToLocation(location, asset);

                if (merged.status === "conflict") {
                    conflicts.push({
                        asset_id: asset.id,
                        asset_name: asset.title || asset.name,
                        asset_type: asset.type,
                        target_id: location.id,
                        target_name: location.name,
                        output_path: this.resolveManagedPath(location),
                        reason: merged.reason,
                    });
                    continue;
                }

                writtenCount += 1;
            }
        }

        return {
            ...this.toScenarioPreviewResult(scenarioId, prepared.locations, prepared.warnings, prepared.items),
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
        items: SyncPreviewResult["items"];
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

        const activeAssets = this.assetRepository
            .list()
            .filter((asset) => asset.status === "active");
        const skillAssets = activeAssets.filter(
            (asset) => asset.type === "skill" && scenario.skillIds.includes(asset.id)
        );
        const agentsMdAssets = activeAssets.filter(
            (asset) => asset.type === "agents-md" && scenario.agentFileIds.includes(asset.id)
        );
        const assetsById = new Map<string, AssetRecord>();

        for (const asset of [...skillAssets, ...agentsMdAssets]) {
            assetsById.set(asset.id, asset);
        }

        if (skillAssets.length === 0 && agentsMdAssets.length === 0) {
            warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync to Agent locations.`);
        }

        const items: SyncPreviewResult["items"] = [];

        for (const location of locations) {
            if (location.kind === "skills") {
                for (const asset of skillAssets) {
                    const outputPath = this.path.join(
                        this.resolveManagedPath(location),
                        asset.name,
                        getAssetMainFileName(asset.type)
                    );
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
                const outputPath = this.resolveManagedPath(location);
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

    private toScenarioPreviewResult(
        scenarioId: string,
        locations: ApplicationLocationRecord[],
        warnings: string[],
        items: SyncPreviewResult["items"]
    ): SyncPreviewResult {
        return {
            scenario_id: scenarioId,
            target_count: locations.length,
            operation_count: items.length,
            create_count: items.filter((item) => item.operation === "create").length,
            update_count: items.filter((item) => item.operation === "update").length,
            merge_count: items.filter((item) => item.operation === "merge").length,
            delete_count: 0,
            warnings,
            items,
        };
    }

    private async writeSkillToLocation(
        location: ApplicationLocationRecord,
        asset: AssetRecord
    ): Promise<void> {
        const content = await this.readAssetContent(asset);
        const skillsRoot = this.resolveManagedPath(location);
        const assetDir = this.path.join(skillsRoot, asset.name);
        await this.fileSystem.ensureDir(assetDir);
        await this.fileSystem.writeText(
            this.path.join(assetDir, getAssetMainFileName(asset.type)),
            content
        );
    }

    private async writeAgentsMdToLocation(
        location: ApplicationLocationRecord,
        asset: AssetRecord
    ): Promise<{status: "ok"} | {status: "conflict"; reason: string}> {
        const agentsMdPath = this.resolveManagedPath(location);
        await this.fileSystem.ensureDir(location.path);
        const originalContent = await this.fileSystem.exists(agentsMdPath)
            ? await this.fileSystem.readText(agentsMdPath)
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

        await this.fileSystem.writeText(agentsMdPath, merged.content);
        return {status: "ok"};
    }

    private async syncSkillLocation(
        location: ApplicationLocationRecord,
        assets: AssetRecord[]
    ): Promise<boolean> {
        if (assets.length === 0) {
            return false;
        }

        const skillsRoot = this.resolveManagedPath(location);
        await this.fileSystem.ensureDir(skillsRoot);

        for (const asset of assets) {
            const content = await this.readAssetContent(asset);
            const assetDir = this.path.join(skillsRoot, asset.name);
            await this.fileSystem.ensureDir(assetDir);
            await this.fileSystem.writeText(
                this.path.join(assetDir, getAssetMainFileName(asset.type)),
                content
            );
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

        const agentsMdPath = this.resolveManagedPath(location);
        await this.fileSystem.ensureDir(location.path);
        let originalContent = "";
        if (await this.fileSystem.exists(agentsMdPath)) {
            originalContent = await this.fileSystem.readText(agentsMdPath);
        }

        let nextContent = originalContent;

        for (const asset of assets) {
            const content = await this.readAssetContent(asset);
            const merged = mergeManagedBlock({
                originalContent: nextContent,
                assetId: asset.id,
                version: asset.version,
                generatedContent: content,
            });

            if (merged.status === "conflict") {
                conflicts.push({
                    asset_id: asset.id,
                    location_id: location.id,
                    reason: merged.reason,
                });
                return false;
            }

            nextContent = merged.content;
        }

        await this.fileSystem.writeText(agentsMdPath, nextContent);
        return true;
    }

    private readAssetContent(asset: AssetRecord): Promise<string> {
        return this.fileSystem.readText(
            this.path.join(asset.path, "current", getAssetMainFileName(asset.type))
        );
    }

    private resolveManagedPath(location: ApplicationLocationRecord): string {
        return location.kind === "skills"
            ? this.path.join(location.path, "skills")
            : this.path.join(location.path, "AGENTS.md");
    }
}
