import type {AssetRepository} from "../asset/assetRepository";
import {type AssetRecord, getAssetMainFileName} from "../types/asset";
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

type ApplicationSyncServiceDependencies = {
    applicationRepository: ApplicationRepository;
    assetRepository: AssetRepository;
    fileSystem: FileSystemPort;
    path: PathPort;
};

export class ApplicationSyncService {
    private readonly applicationRepository: ApplicationRepository;
    private readonly assetRepository: AssetRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;

    constructor(dependencies: ApplicationSyncServiceDependencies) {
        this.applicationRepository = dependencies.applicationRepository;
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

    private async syncSkillLocation(
        location: ApplicationLocationRecord,
        assets: AssetRecord[]
    ): Promise<boolean> {
        if (assets.length === 0) {
            return false;
        }

        await this.fileSystem.ensureDir(location.path);

        for (const asset of assets) {
            const content = await this.readAssetContent(asset);
            const assetDir = this.path.join(location.path, asset.name);
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

        let originalContent = "";
        if (await this.fileSystem.exists(location.path)) {
            originalContent = await this.fileSystem.readText(location.path);
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

        await this.fileSystem.writeText(location.path, nextContent);
        return true;
    }

    private readAssetContent(asset: AssetRecord): Promise<string> {
        return this.fileSystem.readText(
            this.path.join(asset.path, "current", getAssetMainFileName(asset.type))
        );
    }
}
