import {nanoid} from "nanoid";

import type {AssetRepository} from "../asset/assetRepository";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {SnapshotRecord} from "../types/snapshot";
import type {SnapshotRepository} from "./snapshotRepository";

type SnapshotServiceDependencies = {
    assetRepository: AssetRepository;
    snapshotRepository: SnapshotRepository;
    fileSystem: FileSystemPort;
    path: PathPort;
};

function getSnapshotFolderName(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

export class SnapshotService {
    private readonly assetRepository: AssetRepository;
    private readonly snapshotRepository: SnapshotRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;

    constructor(dependencies: SnapshotServiceDependencies) {
        this.assetRepository = dependencies.assetRepository;
        this.snapshotRepository = dependencies.snapshotRepository;
        this.fileSystem = dependencies.fileSystem;
        this.path = dependencies.path;
    }

    async createSnapshot(
        assetId: string,
        assetPath: string,
        message: string
    ): Promise<SnapshotRecord> {
        const now = new Date();
        const snapshotRecord: SnapshotRecord = {
            id: nanoid(),
            asset_id: assetId,
            snapshot_path: this.path.join(
                assetPath,
                "snapshots",
                getSnapshotFolderName(now)
            ),
            message,
            created_at: now.toISOString(),
        };
        const currentDir = this.path.join(assetPath, "current");
        const snapshotsDir = this.path.join(assetPath, "snapshots");

        await this.fileSystem.ensureDir(snapshotsDir);

        if (!(await this.fileSystem.exists(currentDir))) {
            throw new Error(`Current directory not found: ${currentDir}`);
        }

        if (await this.fileSystem.exists(snapshotRecord.snapshot_path)) {
            throw new Error(
                `Snapshot directory already exists: ${snapshotRecord.snapshot_path}`
            );
        }

        await this.fileSystem.copyDir(currentDir, snapshotRecord.snapshot_path);
        this.snapshotRepository.create(snapshotRecord);

        return snapshotRecord;
    }

    listSnapshots(assetId: string): SnapshotRecord[] {
        return this.snapshotRepository.listByAssetId(assetId);
    }

    async restoreSnapshot(snapshotId: string): Promise<{
        restored: true;
        asset_id: string;
        snapshot_id: string;
    }> {
        const snapshot = this.snapshotRepository.findById(snapshotId);

        if (!snapshot) {
            throw new Error(`Snapshot not found: ${snapshotId}`);
        }

        const asset = this.assetRepository.findById(snapshot.asset_id);

        if (!asset) {
            throw new Error(`Asset not found: ${snapshot.asset_id}`);
        }

        if (!(await this.fileSystem.exists(snapshot.snapshot_path))) {
            throw new Error(`Snapshot path not found: ${snapshot.snapshot_path}`);
        }

        const currentDir = this.path.join(asset.path, "current");

        await this.fileSystem.emptyDir(currentDir);
        await this.fileSystem.copyDir(snapshot.snapshot_path, currentDir);

        this.assetRepository.touch(asset.id, new Date().toISOString());

        return {
            restored: true,
            asset_id: snapshot.asset_id,
            snapshot_id: snapshot.id,
        };
    }
}
