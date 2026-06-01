import {ipcMain} from "electron";

import {AssetService} from "../core/asset/assetService";
import {SnapshotService} from "../core/snapshot/snapshotService";
import {createAssetRepository, createSnapshotRepository,} from "../platform/electron/database";
import {nodeFileSystemPort, nodePathPort,} from "../platform/electron/fileSystemPort";
import {getRegistryAssetsDir} from "../platform/electron/paths";

export function registerIpc() {
    const assetRepository = createAssetRepository();
    const snapshotRepository = createSnapshotRepository();
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
}
