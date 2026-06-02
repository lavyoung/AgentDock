import {ipcMain} from "electron";

import {ApplicationService} from "../../../../packages/core/src/application/applicationService";
import {AssetService} from "../../../../packages/core/src/asset/assetService";
import {SnapshotService} from "../../../../packages/core/src/snapshot/snapshotService";
import {TargetService} from "../../../../packages/core/src/target/targetService";
import {
    createApplicationRepository,
    createAssetRepository,
    createSnapshotRepository,
    createTargetRepository,
} from "../platform/electron/database";
import {nodeFileSystemPort, nodePathPort,} from "../platform/electron/fileSystemPort";
import {getHomeDir, getRegistryAssetsDir} from "../platform/electron/paths";

export function registerIpc() {
    const assetRepository = createAssetRepository();
    const applicationRepository = createApplicationRepository();
    const snapshotRepository = createSnapshotRepository();
    const targetRepository = createTargetRepository();
    const snapshotService = new SnapshotService({
        assetRepository,
        snapshotRepository,
        fileSystem: nodeFileSystemPort,
        path: nodePathPort,
    });
    const assetService = new AssetService({
        assetRepository,
        fileSystem: nodeFileSystemPort,
        path: nodePathPort,
        registryAssetsDir: getRegistryAssetsDir(),
        snapshotService,
    });
    const targetService = new TargetService({
        fileSystem: nodeFileSystemPort,
        path: nodePathPort,
        targetRepository,
    });
    const applicationService = new ApplicationService({
        applicationRepository,
        fileSystem: nodeFileSystemPort,
        homeDir: getHomeDir(),
        path: nodePathPort,
        targetRepository,
    });

    ipcMain.handle("assets:list", async () => {
        return assetService.listAssets();
    });

    ipcMain.handle("assets:get", async (_event, id: string) => {
        return assetService.getAsset(id);
    });

    ipcMain.handle("assets:create", async (_event, input) => {
        return assetService.createAsset(input);
    });

    ipcMain.handle("assets:update", async (_event, id: string, input) => {
        return assetService.updateAsset(id, input);
    });

    ipcMain.handle("snapshots:list", async (_event, assetId: string) => {
        return snapshotService.listSnapshots(assetId);
    });

    ipcMain.handle("snapshots:restore", async (_event, snapshotId: string) => {
        return snapshotService.restoreSnapshot(snapshotId);
    });

    ipcMain.handle("targets:list", async () => {
        return targetService.listTargets();
    });

    ipcMain.handle("targets:get", async (_event, id: string) => {
        return targetService.getTarget(id);
    });

    ipcMain.handle("targets:create", async (_event, input) => {
        return targetService.createTarget(input);
    });

    ipcMain.handle("targets:update", async (_event, id: string, input) => {
        return targetService.updateTarget(id, input);
    });

    ipcMain.handle("targets:delete", async (_event, id: string) => {
        targetService.deleteTarget(id);

        return {
            deleted: true,
            target_id: id,
        };
    });

    ipcMain.handle("applications:list", async () => {
        return applicationService.listApplications();
    });

    ipcMain.handle("applications:get", async (_event, id: "codex") => {
        return applicationService.getApplication(id);
    });

    ipcMain.handle("applications:update", async (_event, id: "codex", input) => {
        return applicationService.updateApplication(id, input);
    });

    ipcMain.handle(
        "applications:refresh-locations",
        async (_event, id: "codex") => {
            return applicationService.refreshLocations(id);
        }
    );

    ipcMain.handle(
        "applications:update-location",
        async (_event, id: string, input) => {
            return applicationService.updateLocation(id, input);
        }
    );
}
