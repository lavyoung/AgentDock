import {createAsset, listAssets} from "../core/asset/assetService";
import {ipcMain} from 'electron'

export function registerIpc() {
    ipcMain.handle("assets:list", async () => {
        return listAssets();
    });

    ipcMain.handle("assets:create", async (_event, input) => {
        return createAsset(input);
    })
}
