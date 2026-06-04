import {BrowserWindow, ipcMain} from "electron";
import {ApplicationService} from "../../../../packages/core/src/application/applicationService";
import type {ApplicationId} from "../../../../packages/core/src/types/application";
import {AssetService} from "../../../../packages/core/src/asset/assetService";
import {type CreateRuleInput, RuleService, type UpdateRuleInput} from "../../../../packages/core/src/rules/ruleService";
import {
    type CreateScenarioInput,
    ScenarioService,
    type UpdateScenarioInput
} from "../../../../packages/core/src/scenario/scenarioService";
import {SnapshotService} from "../../../../packages/core/src/snapshot/snapshotService";
import {TargetService} from "../../../../packages/core/src/target/targetService";
import {
    createApplicationRepository,
    createAssetRepository,
    createRuleRepository,
    createScenarioRepository,
    createSnapshotRepository,
    createTargetRepository,
} from "../platform/electron/database";
import {nodeFileSystemPort, nodePathPort,} from "../platform/electron/fileSystemPort";
import {getHomeDir, getRegistryAssetsDir} from "../platform/electron/paths";

let _mainWindow: BrowserWindow | null = null;
const DARK_WINDOW_CHROME = "#0a0a0b";
const LIGHT_WINDOW_CHROME = "#f4f4f5";

export function setMainWindow(win: BrowserWindow): void {
    _mainWindow = win;
}

export function registerIpc() {
    const assetRepository = createAssetRepository();
    const applicationRepository = createApplicationRepository();
    const snapshotRepository = createSnapshotRepository();
    const targetRepository = createTargetRepository();
    const scenarioRepository = createScenarioRepository();
    const ruleRepository = createRuleRepository();
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
    const scenarioService = new ScenarioService({
        scenarioRepository,
    });
    const ruleService = new RuleService({
        ruleRepository,
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

    ipcMain.handle("assets:setStatus", async (_event, id: string, status: "active" | "disabled") => {
        return assetService.setAssetStatus(id, status);
    });

    ipcMain.handle("assets:delete", async (_event, id: string) => {
        await assetService.deleteAsset(id);
        return {
            deleted: true,
            asset_id: id,
        };
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

    ipcMain.handle("applications:get", async (_event, id: ApplicationId) => {
        return applicationService.getApplication(id);
    });

    ipcMain.handle("applications:update", async (_event, id: ApplicationId, input) => {
        return applicationService.updateApplication(id, input);
    });

    ipcMain.handle(
        "applications:refresh-locations",
        async (_event, id: ApplicationId) => {
            return applicationService.refreshLocations(id);
        }
    );

    ipcMain.handle(
        "applications:update-location",
        async (_event, id: string, input) => {
            return applicationService.updateLocation(id, input);
        }
    );

    // ---------- scenarios ----------
    ipcMain.handle("scenarios:list", async () => {
        return scenarioService.listScenarios();
    });

    ipcMain.handle("scenarios:get", async (_event, id: string) => {
        return scenarioService.getScenario(id);
    });

    ipcMain.handle("scenarios:create", async (_event, input: CreateScenarioInput) => {
        return scenarioService.createScenario(input);
    });

    ipcMain.handle("scenarios:update", async (_event, id: string, input: UpdateScenarioInput) => {
        return scenarioService.updateScenario(id, input);
    });

    ipcMain.handle("scenarios:delete", async (_event, id: string) => {
        scenarioService.deleteScenario(id);
        return {deleted: true, scenario_id: id};
    });

    ipcMain.handle(
        "scenarios:add-asset",
        async (_event, scenarioId: string, field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string) => {
            await scenarioService.addAssetToScenario(scenarioId, field, assetId);
            return scenarioService.getScenario(scenarioId);
        }
    );

    ipcMain.handle(
        "scenarios:remove-asset",
        async (_event, scenarioId: string, field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string) => {
            await scenarioService.removeAssetFromScenario(scenarioId, field, assetId);
            return scenarioService.getScenario(scenarioId);
        }
    );

    // ---------- rules ----------
    ipcMain.handle("rules:list", async () => {
        return ruleService.listRules();
    });

    ipcMain.handle("rules:get", async (_event, id: string) => {
        return ruleService.getRule(id);
    });

    ipcMain.handle("rules:create", async (_event, input: CreateRuleInput) => {
        return ruleService.createRule(input);
    });

    ipcMain.handle("rules:update", async (_event, id: string, input: UpdateRuleInput) => {
        return ruleService.updateRule(id, input);
    });

    ipcMain.handle("rules:delete", async (_event, id: string) => {
        ruleService.deleteRule(id);
        return {deleted: true, rule_id: id};
    });

    // ---------- window controls ----------
    ipcMain.handle("window:setOverlay", async (_event, theme: "dark" | "light") => {
        if (!_mainWindow) return;
        if (theme === "light") {
            _mainWindow.setTitleBarOverlay({color: LIGHT_WINDOW_CHROME, symbolColor: "#3f3f46", height: 32});
        } else {
            _mainWindow.setTitleBarOverlay({color: DARK_WINDOW_CHROME, symbolColor: "#a1a1aa", height: 32});
        }
    });

    ipcMain.on("window:ready", (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win || win.isDestroyed() || win.isVisible()) {
            return;
        }

        setMainWindow(win);
        win.show();
    });
}
