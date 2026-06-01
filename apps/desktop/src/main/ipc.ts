import {createAsset, getAsset, listAssets, updateAsset} from "../core/asset/assetService";
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
}
