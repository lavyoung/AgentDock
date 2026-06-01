import {nanoid} from "nanoid";
import yaml from "yaml";

import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {AssetDetail, AssetRecord, CreateAssetInput, UpdateAssetInput,} from "../types/asset";
import {getAssetMainFileName} from "../types/asset";
import type {SnapshotService} from "../snapshot/snapshotService";
import type {AssetRepository} from "./assetRepository";

type AssetServiceDependencies = {
    assetRepository: AssetRepository;
    fileSystem: FileSystemPort;
    path: PathPort;
    registryAssetsDir: string;
    snapshotService: SnapshotService;
};

export class AssetService {
    private readonly assetRepository: AssetRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;
    private readonly registryAssetsDir: string;
    private readonly snapshotService: SnapshotService;

    constructor(dependencies: AssetServiceDependencies) {
        this.assetRepository = dependencies.assetRepository;
        this.fileSystem = dependencies.fileSystem;
        this.path = dependencies.path;
        this.registryAssetsDir = dependencies.registryAssetsDir;
        this.snapshotService = dependencies.snapshotService;
    }

    listAssets(): AssetRecord[] {
        return this.assetRepository.list();
    }

    async createAsset(input: CreateAssetInput): Promise<AssetRecord> {
        const id = nanoid();
        const now = new Date().toISOString();
        const version = "0.1.0";
        const status = "active";
        const safeName = input.name.trim();
        const assetDir = this.path.join(this.registryAssetsDir, safeName);
        const currentDir = this.path.join(assetDir, "current");
        const metadata = {
            id,
            type: input.type,
            name: safeName,
            title: input.title ?? safeName,
            description: input.description ?? "",
            version,
            status,
        };
        const assetRecord: AssetRecord = {
            ...metadata,
            path: assetDir,
            created_at: now,
            updated_at: now,
        };

        await this.fileSystem.ensureDir(currentDir);
        await this.fileSystem.writeText(
            this.path.join(currentDir, "asset.yaml"),
            yaml.stringify(metadata)
        );
        await this.fileSystem.writeText(
            this.path.join(currentDir, getAssetMainFileName(input.type)),
            input.content
        );

        this.assetRepository.create(assetRecord);

        return assetRecord;
    }

    async getAsset(id: string): Promise<AssetDetail | null> {
        const asset = this.assetRepository.findById(id);

        if (!asset) {
            return null;
        }

        const content = await this.fileSystem.readText(
            this.path.join(asset.path, "current", getAssetMainFileName(asset.type))
        );

        return {
            ...asset,
            content,
        };
    }

    async updateAsset(id: string, input: UpdateAssetInput): Promise<AssetDetail | null> {
        const asset = this.assetRepository.findById(id);

        if (!asset) {
            throw new Error(`Asset not found: ${id}`);
        }

        const now = new Date().toISOString();
        const nextTitle = input.title ?? asset.title;
        const nextDescription = input.description ?? asset.description;
        const currentDir = this.path.join(asset.path, "current");
        const metadata = {
            id: asset.id,
            type: asset.type,
            name: asset.name,
            title: nextTitle,
            description: nextDescription,
            version: asset.version,
            status: asset.status,
        };

        await this.snapshotService.createSnapshot(
            asset.id,
            asset.path,
            "Before asset update"
        );
        await this.fileSystem.writeText(
            this.path.join(currentDir, "asset.yaml"),
            yaml.stringify(metadata)
        );

        if (typeof input.content === "string") {
            await this.fileSystem.writeText(
                this.path.join(currentDir, getAssetMainFileName(asset.type)),
                input.content
            );
        }

        this.assetRepository.updateDetails(id, {
            title: nextTitle,
            description: nextDescription,
            updated_at: now,
        });

        return this.getAsset(id);
    }
}
