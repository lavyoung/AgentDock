import {createAsset, getAsset, listAssets, updateAsset} from "../core/asset/assetService";
import {listSnapshots, restoreSnapshot} from "../core/snapshot/snapshotService";
import {ipcMain} from 'electron'

export function registerIpc() {

    ipcMain.handle("assets:list", async () => {
        return listAssets();
    });

    ipcMain.handle("assets:get", async (_event, id: string) => {
        return getAsset(id);
    });

    ipcMain.handle("assets:create", async (_event, input) => {
        return createAsset(input);
    });

    ipcMain.handle("assets:update", async (_event, id: string, input) => {
        return updateAsset(id, input);
    });

    ipcMain.handle("snapshots:list", async (_event, assetId: string) => {
        return listSnapshots(assetId);
    });

    ipcMain.handle("snapshots:restore", async (_event, snapshotId: string) => {
        return restoreSnapshot(snapshotId);
    });
}
