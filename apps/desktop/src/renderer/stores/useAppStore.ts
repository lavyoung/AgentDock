import {create} from "zustand";

import type {
    ApplicationDetail,
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationRecord,
} from "../../../../../packages/core/src/types/application";
import type {
    AssetDetail,
    AssetRecord,
    AssetStatus,
    AssetType,
    CreateAssetInput,
    RuleRecord,
    RuleSeverity,
    ScenarioRecord,
} from "../../../../../packages/core/src/types/asset";
import type {SnapshotRecord} from "../../../../../packages/core/src/types/snapshot";
import type {
    SyncHistoryEntry,
    SyncInlineTarget,
    SyncPreviewResult,
    SyncRunResult
} from "../../../../../packages/core/src/types/sync";
import type {TargetDeployMode, TargetRecord} from "../../../../../packages/core/src/types/target";
import {agentdockClient} from "../client/agentdockClient";

function applyTheme(theme: "dark" | "light" | "system"): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const effective =
        theme === "system"
            ? window.matchMedia?.("(prefers-color-scheme: light)").matches
                ? "light"
                : "dark"
            : theme;
    if (effective === "light") {
        root.classList.add("theme-light");
    } else {
        root.classList.remove("theme-light");
    }
    // Sync window title-bar overlay color with theme
    try {
        (window as unknown as Record<string, unknown>).electron?.setOverlay(effective);
    } catch {
        /* ignore in mock/dev mode */
    }
}

export type ViewKey = "overview" | "assets" | "install" | "scenarios" | "targets" | "projects" | "settings";
export type ScenarioDetailView = "view" | "edit";
export type ThemeMode = "dark" | "light" | "system";
export type ProjectSyncMode = "manual" | "preview-first";
export type ProjectSyncStatus = "pending" | "synced" | "conflict";
export type StoredSettings = {
    dataPath: string;
    autoUpdate: boolean;
    notifications: boolean;
    sound: boolean;
};

export type ProjectRecord = {
    id: string;
    name: string;
    path: string;
    defaultScenarioId: string | null;
    targetIds: string[];
    syncMode: ProjectSyncMode;
    syncStatus: ProjectSyncStatus;
    lastSyncedAt: string | null;
    agentLabel: string;
    syncHistory: SyncHistoryEntry[];
    createdAt: string;
    updatedAt: string;
};

const PROJECTS_STORAGE_KEY = "agentdock:projects";
const SETTINGS_STORAGE_KEY = "agentdock:settings";
const MAX_PROJECT_SYNC_HISTORY = 8;
const DEFAULT_STORED_SETTINGS: StoredSettings = {
    dataPath: "~/.agentdock",
    autoUpdate: true,
    notifications: true,
    sound: false,
};

export type ToastKind = "info" | "success" | "error";

export type Toast = {
    id: string;
    kind: ToastKind;
    message: string;
};

export type AssetFilter = "all" | "enabled" | "disabled";
export type AssetTypeFilter = "all" | AssetType;

function createProjectId(name: string): string {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    if (base) {
        return base;
    }

    return `project-${Date.now()}`;
}

function buildProjectInlineSyncTargets(project: ProjectRecord): SyncInlineTarget[] {
    if (project.targetIds.length > 0) {
        return [];
    }

    return [{
        id: `project-root:${project.id}`,
        name: `${project.name} root`,
        path: project.path,
        deployMode: "merge",
    }];
}

function normalizeSyncHistoryEntry(value: unknown): SyncHistoryEntry | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const candidate = value as Record<string, unknown>;
    if (
        typeof candidate.id !== "string" ||
        typeof candidate.scenario_id !== "string" ||
        typeof candidate.synced_at !== "string" ||
        typeof candidate.target_count !== "number" ||
        typeof candidate.operation_count !== "number" ||
        typeof candidate.written_count !== "number" ||
        typeof candidate.warning_count !== "number" ||
        typeof candidate.conflict_count !== "number" ||
        (candidate.status !== "success" && candidate.status !== "warning" && candidate.status !== "conflict")
    ) {
        return null;
    }

    const warnings = Array.isArray(candidate.warnings)
        ? candidate.warnings.filter((warning): warning is string => typeof warning === "string")
        : [];
    const conflicts = Array.isArray(candidate.conflicts)
        ? candidate.conflicts.flatMap((conflict) => {
            if (!conflict || typeof conflict !== "object") {
                return [];
            }

            const nextConflict = conflict as Record<string, unknown>;
            if (
                typeof nextConflict.asset_id !== "string" ||
                typeof nextConflict.asset_name !== "string" ||
                typeof nextConflict.asset_type !== "string" ||
                typeof nextConflict.target_id !== "string" ||
                typeof nextConflict.target_name !== "string" ||
                typeof nextConflict.output_path !== "string" ||
                typeof nextConflict.reason !== "string"
            ) {
                return [];
            }

            return [{
                asset_id: nextConflict.asset_id,
                asset_name: nextConflict.asset_name,
                asset_type: nextConflict.asset_type as SyncHistoryEntry["conflicts"][number]["asset_type"],
                target_id: nextConflict.target_id,
                target_name: nextConflict.target_name,
                output_path: nextConflict.output_path,
                reason: nextConflict.reason,
            }];
        })
        : [];
    const outputs = Array.isArray(candidate.outputs)
        ? candidate.outputs.flatMap((output) => {
            if (!output || typeof output !== "object") {
                return [];
            }

            const nextOutput = output as Record<string, unknown>;
            if (
                typeof nextOutput.asset_id !== "string" ||
                typeof nextOutput.asset_name !== "string" ||
                typeof nextOutput.asset_type !== "string" ||
                typeof nextOutput.target_id !== "string" ||
                typeof nextOutput.target_name !== "string" ||
                typeof nextOutput.output_path !== "string" ||
                (nextOutput.operation !== "create" &&
                    nextOutput.operation !== "update" &&
                    nextOutput.operation !== "merge")
            ) {
                return [];
            }

            return [{
                asset_id: nextOutput.asset_id,
                asset_name: nextOutput.asset_name,
                asset_type: nextOutput.asset_type as SyncHistoryEntry["outputs"][number]["asset_type"],
                target_id: nextOutput.target_id,
                target_name: nextOutput.target_name,
                output_path: nextOutput.output_path,
                operation: nextOutput.operation as SyncHistoryEntry["outputs"][number]["operation"],
            }];
        })
        : [];

    return {
        id: candidate.id,
        scenario_id: candidate.scenario_id,
        synced_at: candidate.synced_at,
        target_count: candidate.target_count,
        operation_count: candidate.operation_count,
        written_count: candidate.written_count,
        warning_count: candidate.warning_count,
        conflict_count: candidate.conflict_count,
        status: candidate.status as SyncHistoryEntry["status"],
        warnings,
        conflicts,
        outputs,
    };
}

function readStoredProjects(): ProjectRecord[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.flatMap((item) => {
            if (!item || typeof item !== "object") {
                return [];
            }

            const candidate = item as Record<string, unknown>;
            if (
                typeof candidate.id !== "string" ||
                typeof candidate.name !== "string" ||
                typeof candidate.path !== "string" ||
                (typeof candidate.defaultScenarioId !== "string" && candidate.defaultScenarioId !== null) ||
                (candidate.syncMode !== "manual" && candidate.syncMode !== "preview-first") ||
                typeof candidate.agentLabel !== "string" ||
                typeof candidate.createdAt !== "string" ||
                typeof candidate.updatedAt !== "string"
            ) {
                return [];
            }

            return [{
                id: candidate.id,
                name: candidate.name,
                path: candidate.path,
                defaultScenarioId: candidate.defaultScenarioId,
                targetIds: Array.isArray(candidate.targetIds)
                    ? candidate.targetIds.filter((value): value is string => typeof value === "string")
                    : [],
                syncMode: candidate.syncMode,
                syncStatus:
                    candidate.syncStatus === "synced" || candidate.syncStatus === "conflict"
                        ? candidate.syncStatus
                        : "pending",
                lastSyncedAt:
                    typeof candidate.lastSyncedAt === "string" ? candidate.lastSyncedAt : null,
                agentLabel: candidate.agentLabel,
                syncHistory: Array.isArray(candidate.syncHistory)
                    ? candidate.syncHistory
                        .flatMap((entry) => {
                            const normalizedEntry = normalizeSyncHistoryEntry(entry);
                            return normalizedEntry ? [normalizedEntry] : [];
                        })
                        .slice(0, MAX_PROJECT_SYNC_HISTORY)
                    : [],
                createdAt: candidate.createdAt,
                updatedAt: candidate.updatedAt,
            }];
        });
    } catch {
        return [];
    }
}

function persistProjects(projects: ProjectRecord[]): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
        /* ignore */
    }
}

function readStoredSettings(): StoredSettings {
    if (typeof window === "undefined") {
        return DEFAULT_STORED_SETTINGS;
    }

    try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) {
            return DEFAULT_STORED_SETTINGS;
        }

        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object") {
            return DEFAULT_STORED_SETTINGS;
        }

        const candidate = parsed as Record<string, unknown>;
        return {
            dataPath:
                typeof candidate.dataPath === "string" && candidate.dataPath.trim()
                    ? candidate.dataPath
                    : DEFAULT_STORED_SETTINGS.dataPath,
            autoUpdate:
                typeof candidate.autoUpdate === "boolean"
                    ? candidate.autoUpdate
                    : DEFAULT_STORED_SETTINGS.autoUpdate,
            notifications:
                typeof candidate.notifications === "boolean"
                    ? candidate.notifications
                    : DEFAULT_STORED_SETTINGS.notifications,
            sound:
                typeof candidate.sound === "boolean"
                    ? candidate.sound
                    : DEFAULT_STORED_SETTINGS.sound,
        };
    } catch {
        return DEFAULT_STORED_SETTINGS;
    }
}

function persistStoredSettings(settings: StoredSettings): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
        /* ignore */
    }
}

const initialStoredSettings = readStoredSettings();

type State = {
    view: ViewKey;

    // assets
    assets: AssetRecord[];
    selectedAsset: AssetDetail | null;
    snapshots: SnapshotRecord[];
    editorTitle: string;
    editorDescription: string;
    editorContent: string;

    // asset page filters
    assetFilter: AssetFilter;
    assetTypeFilter: AssetTypeFilter;
    assetSearch: string;

    // detail panel (floating overlay)
    detailPanelOpen: boolean;
    detailPanelTab: "overview" | "content" | "history";

    // rules
    rules: RuleRecord[];
    selectedRule: RuleRecord | null;
    ruleName: string;
    ruleTitle: string;
    ruleDescription: string;
    ruleSeverity: RuleSeverity;
    ruleEnabled: boolean;

    // scenarios
    scenarios: ScenarioRecord[];
    selectedScenario: ScenarioRecord | null;
    scenarioDetailView: ScenarioDetailView;
    scenarioName: string;
    scenarioTitle: string;
    scenarioDescription: string;
    scenarioCreateModalOpen: boolean;

    // projects
    projects: ProjectRecord[];
    selectedProjectId: string | null;
    projectName: string;
    projectPath: string;
    projectDefaultScenarioId: string | null;
    projectSyncMode: ProjectSyncMode;
    projectAgentLabel: string;
    selectedProjectSyncPreview: SyncPreviewResult | null;

    // asset picker (modal for adding to scenario)
    assetPickerOpen: boolean;
    assetPickerField: "skillIds" | "ruleIds" | "agentFileIds" | null;

    // targets
    targets: TargetRecord[];
    selectedTarget: TargetRecord | null;
    targetName: string;
    targetPath: string;
    targetDeployMode: TargetDeployMode;
    targetEnabled: boolean;

    // applications (settings page)
    applications: ApplicationRecord[];
    selectedApplicationId: ApplicationId | null;
    selectedApplicationDetail: ApplicationDetail | null;
    applicationEnabled: boolean;
    selectedLocation: ApplicationLocationRecord | null;
    locationName: string;
    locationPath: string;
    locationEnabled: boolean;

    // persisted settings
    settingsDataPath: string;
    settingsAutoUpdate: boolean;
    settingsNotifications: boolean;
    settingsSound: boolean;

    // ui
    toasts: Toast[],
    theme: ThemeMode;

    // internal — populated by I18nProvider binding
    _t: (key: string) => string;
};

type Actions = {
    setView(view: ViewKey): void;
    setTheme(theme: ThemeMode): void;

    refreshAssets(): Promise<void>;
    openAsset(id: string): Promise<void>;
    saveAsset(): Promise<void>;
    createAsset(input: CreateAssetInput): Promise<AssetRecord>;
    deleteAsset(): Promise<void>;
    createDemoSkill(): Promise<void>;
    createDemoAgentsMd(): Promise<void>;
    restoreSelectedSnapshot(snapshotId: string): Promise<void>;
    setEditorTitle(value: string): void;
    setEditorDescription(value: string): void;
    setEditorContent(value: string): void;
    setAssetFilter(filter: AssetFilter): void;
    setAssetTypeFilter(filter: AssetTypeFilter): void;
    setAssetSearch(value: string): void;
    openDetailPanel(assetId: string): Promise<void>;
    closeDetailPanel(): void;
    setDetailPanelTab(tab: "overview" | "content" | "history"): void;
    toggleAssetStatus(assetId: string): Promise<void>;

    refreshRules(): Promise<void>;
    openRule(id: string): Promise<void>;
    saveRule(): Promise<void>;
    deleteRule(): Promise<void>;
    resetRuleForm(): void;
    setRuleName(value: string): void;
    setRuleTitle(value: string): void;
    setRuleDescription(value: string): void;
    setRuleSeverity(value: RuleSeverity): void;
    setRuleEnabled(value: boolean): void;

    refreshScenarios(): Promise<void>;
    openScenario(id: string): Promise<void>;
    saveScenario(): Promise<void>;
    deleteScenario(): Promise<void>;
    resetScenarioForm(): void;
    setScenarioName(value: string): void;
    setScenarioTitle(value: string): void;
    setScenarioDescription(value: string): void;
    setScenarioDetailView(view: ScenarioDetailView): void;
    openScenarioCreateModal(): void;
    closeScenarioCreateModal(): void;
    openAssetPicker(field: "skillIds" | "ruleIds" | "agentFileIds"): void;
    closeAssetPicker(): void;
    addAssetToScenario(field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;
    removeAssetFromScenario(field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;
    addAgentAppToScenario(agentId: string): Promise<void>;
    removeAgentAppFromScenario(agentId: string): Promise<void>;
    addProjectToScenario(projectId: string): Promise<void>;
    removeProjectFromScenario(projectId: string): Promise<void>;

    openProject(id: string): void;
    createProject(): Promise<ProjectRecord>;
    previewSelectedProjectSync(): Promise<void>;
    runSelectedProjectSync(): Promise<void>;
    previewProjectSync(projectId: string): Promise<SyncPreviewResult>;
    runProjectSync(projectId: string): Promise<SyncRunResult>;
    toggleSelectedProjectTarget(targetId: string): void;
    resetProjectForm(): void;
    setProjectName(value: string): void;
    setProjectPath(value: string): void;
    setProjectDefaultScenarioId(value: string | null): void;
    setProjectSyncMode(value: ProjectSyncMode): void;
    setProjectAgentLabel(value: string): void;

    refreshTargets(): Promise<void>;
    openTarget(id: string): Promise<void>;
    saveTarget(): Promise<void>;
    deleteTarget(): Promise<void>;
    resetTargetForm(): void;
    setTargetName(value: string): void;
    setTargetPath(value: string): void;
    setTargetDeployMode(mode: TargetDeployMode): void;
    setTargetEnabled(value: boolean): void;

    refreshApplications(): Promise<void>;
    openApplication(id: ApplicationId): Promise<void>;
    saveApplication(): Promise<void>;
    detectApplicationLocations(): Promise<void>;
    saveApplicationLocation(): Promise<void>;
    runApplicationSync(): Promise<void>;
    selectLocation(location: ApplicationLocationRecord | null): void;
    setApplicationEnabled(value: boolean): void;
    setLocationName(value: string): void;
    setLocationPath(value: string): void;
    setLocationEnabled(value: boolean): void;
    setSettingsDataPath(value: string): void;
    setSettingsAutoUpdate(value: boolean): void;
    setSettingsNotifications(value: boolean): void;
    setSettingsSound(value: boolean): void;

    pushToast(kind: ToastKind, message: string): void;
    dismissToast(id: string): void;
};

export type AppStore = State & Actions;

const initialState: State = {
    view: "assets",

    assets: [],
    selectedAsset: null,
    snapshots: [],
    editorTitle: "",
    editorDescription: "",
    editorContent: "",

    assetFilter: "all",
    assetTypeFilter: "all",
    assetSearch: "",

    detailPanelOpen: false,
    detailPanelTab: "overview",

    rules: [],
    selectedRule: null,
    ruleName: "",
    ruleTitle: "",
    ruleDescription: "",
    ruleSeverity: "info",
    ruleEnabled: true,

    scenarios: [],
    selectedScenario: null,
    scenarioDetailView: "view",
    scenarioName: "",
    scenarioTitle: "",
    scenarioDescription: "",
    scenarioCreateModalOpen: false,

    projects: readStoredProjects(),
    selectedProjectId: null,
    projectName: "",
    projectPath: "",
    projectDefaultScenarioId: "default",
    projectSyncMode: "manual",
    projectAgentLabel: "OpenCode Agent",
    selectedProjectSyncPreview: null,

    assetPickerOpen: false,
    assetPickerField: null,

    targets: [],
    selectedTarget: null,
    targetName: "",
    targetPath: "",
    targetDeployMode: "copy",
    targetEnabled: true,

    applications: [],
    selectedApplicationId: null,
    selectedApplicationDetail: null,
    applicationEnabled: false,
    selectedLocation: null,
    locationName: "",
    locationPath: "",
    locationEnabled: false,

    settingsDataPath: initialStoredSettings.dataPath,
    settingsAutoUpdate: initialStoredSettings.autoUpdate,
    settingsNotifications: initialStoredSettings.notifications,
    settingsSound: initialStoredSettings.sound,

    toasts: [],
    theme: (() => {
        try {
            const stored = window.localStorage?.getItem("agentdock:theme");
            if (stored === "dark" || stored === "light" || stored === "system") {
                applyTheme(stored);
                return stored;
            }
        } catch {
            /* ignore */
        }
        return "dark";
    })(),

    _t: (key: string) => key,
};

let toastIdCounter = 0;
function nextToastId(): string {
    toastIdCounter += 1;
    return `t-${Date.now()}-${toastIdCounter}`;
}

export const useAppStore = create<AppStore>((set, get) => ({
    ...initialState,

    setView(view) {
        set({view});
    },

    setTheme(theme) {
        set({theme});
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem("agentdock:theme", theme);
            } catch {
                /* ignore */
            }
        }
        applyTheme(theme);
    },

    // ---------- assets ----------
    async refreshAssets() {
        set({assets: await agentdockClient.assets.list()});
    },

    async openAsset(id) {
        const detail = await agentdockClient.assets.get(id);
        if (!detail) {
            set({selectedAsset: null, editorTitle: "", editorDescription: "", editorContent: "", snapshots: []});
            return;
        }
        set({selectedAsset: detail, editorTitle: detail.title, editorDescription: detail.description, editorContent: detail.content});
        const snapshots = await agentdockClient.snapshots.list(id);
        set({snapshots});
    },

    async saveAsset() {
        const {selectedAsset, editorTitle, editorDescription, editorContent} = get();
        if (!selectedAsset) return;
        const updated = await agentdockClient.assets.update(selectedAsset.id, {
            title: editorTitle,
            description: editorDescription,
            content: editorContent,
        });
        if (updated) set({selectedAsset: updated});
        await get().refreshAssets();
        const snapshots = await agentdockClient.snapshots.list(selectedAsset.id);
        set({snapshots});
    },

    async createAsset(input) {
        const created = await agentdockClient.assets.create(input);
        await get().refreshAssets();
        await get().openAsset(created.id);
        set({detailPanelOpen: true, detailPanelTab: "overview"});
        return created;
    },

    async deleteAsset() {
        const {selectedAsset} = get();
        if (!selectedAsset) return;
        await agentdockClient.assets.delete(selectedAsset.id);
        await get().refreshAssets();
        set({
            selectedAsset: null,
            editorTitle: "",
            editorDescription: "",
            editorContent: "",
            snapshots: [],
            detailPanelOpen: false,
            detailPanelTab: "overview",
        });
    },

    async createDemoSkill() {
        const timestamp = Date.now();
        const t = get()._t;
        await agentdockClient.assets.create({
            type: "skill",
            name: `frontend-review-${timestamp}`,
            title: t("demoSkillTitle"),
            description: t("demoSkillDescription"),
            content: t("demoSkillContent"),
        });
        await get().refreshAssets();
    },

    async createDemoAgentsMd() {
        const timestamp = Date.now();
        const t = get()._t;
        await agentdockClient.assets.create({
            type: "agents-md",
            name: `frontend-agents-${timestamp}`,
            title: t("demoAgentsTitle"),
            description: t("demoAgentsDescription"),
            content: t("demoAgentsContent"),
        });
        await get().refreshAssets();
    },

    async restoreSelectedSnapshot(snapshotId) {
        const {selectedAsset} = get();
        if (!selectedAsset) return;
        await agentdockClient.snapshots.restore(snapshotId);
        await get().openAsset(selectedAsset.id);
        await get().refreshAssets();
    },

    setEditorTitle(value) { set({editorTitle: value}); },
    setEditorDescription(value) { set({editorDescription: value}); },
    setEditorContent(value) { set({editorContent: value}); },

    setAssetFilter(filter) { set({assetFilter: filter}); },
    setAssetTypeFilter(filter) { set({assetTypeFilter: filter}); },
    setAssetSearch(value) { set({assetSearch: value}); },

    async openDetailPanel(assetId) {
        try {
            await get().openAsset(assetId);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[AgentDock] openDetailPanel.openAsset failed:", err);
            get().pushToast(
                "error",
                get()
                    ._t("assetOpenFailed")
                    .replace("{message}", err instanceof Error ? err.message : String(err))
            );
            return;
        }
        set({detailPanelOpen: true, detailPanelTab: "overview"});
    },

    closeDetailPanel() { set({detailPanelOpen: false}); },
    setDetailPanelTab(tab) { set({detailPanelTab: tab}); },

    async toggleAssetStatus(assetId) {
        const current = get().assets.find((a) => a.id === assetId);
        if (!current) return;
        const nextStatus: "active" | "disabled" = current.status === "active" ? "disabled" : "active";
        await agentdockClient.assets.setStatus(assetId, nextStatus);
        const updated = await agentdockClient.assets.list();
        set({assets: updated});
        if (get().selectedAsset?.id === assetId) {
            await get().openAsset(assetId);
        }
    },

    // ---------- rules ----------
    async refreshRules() {
        set({rules: await agentdockClient.rules.list()});
    },

    async openRule(id) {
        const rule = await agentdockClient.rules.get(id);
        if (!rule) {
            get().resetRuleForm();
            return;
        }
        set({selectedRule: rule, ruleName: rule.name, ruleTitle: rule.title, ruleDescription: rule.description, ruleSeverity: rule.severity, ruleEnabled: rule.enabled});
    },

    async saveRule() {
        const {selectedRule, ruleName, ruleTitle, ruleDescription, ruleSeverity, ruleEnabled} = get();
        if (!ruleName.trim()) {
            get().pushToast("error", get()._t("toastRuleNameRequired"));
            return;
        }
        if (!selectedRule) {
            const created = await agentdockClient.rules.create({name: ruleName, title: ruleTitle, description: ruleDescription, severity: ruleSeverity, enabled: ruleEnabled});
            set({selectedRule: created});
        } else {
            const updated = await agentdockClient.rules.update(selectedRule.id, {name: ruleName, title: ruleTitle, description: ruleDescription, severity: ruleSeverity, enabled: ruleEnabled});
            set({selectedRule: updated});
        }
        await get().refreshRules();
    },

    async deleteRule() {
        const {selectedRule} = get();
        if (!selectedRule) return;
        await agentdockClient.rules.delete(selectedRule.id);
        get().resetRuleForm();
        await get().refreshRules();
    },

    resetRuleForm() {
        set({selectedRule: null, ruleName: "", ruleTitle: "", ruleDescription: "", ruleSeverity: "info", ruleEnabled: true});
    },

    setRuleName(value) { set({ruleName: value}); },
    setRuleTitle(value) { set({ruleTitle: value}); },
    setRuleDescription(value) { set({ruleDescription: value}); },
    setRuleSeverity(value) { set({ruleSeverity: value}); },
    setRuleEnabled(value) { set({ruleEnabled: value}); },

    // ---------- scenarios ----------
    async refreshScenarios() {
        set({scenarios: await agentdockClient.scenarios.list()});
    },

    async openScenario(id) {
        const scenario = await agentdockClient.scenarios.get(id);
        if (!scenario) {
            get().resetScenarioForm();
            return;
        }
        set({selectedScenario: scenario, scenarioName: scenario.name, scenarioTitle: scenario.title, scenarioDescription: scenario.description, scenarioDetailView: "view"});
    },

    async saveScenario() {
        const {selectedScenario, scenarioName, scenarioTitle, scenarioDescription} = get();
        const effectiveName = selectedScenario?.isBuiltIn ? selectedScenario.name : scenarioName.trim();
        const effectiveTitle = scenarioTitle.trim() || effectiveName;

        if (!effectiveName.trim()) {
            get().pushToast("error", get()._t("toastScenarioNameRequired"));
            return;
        }
        if (!selectedScenario) {
            const created = await agentdockClient.scenarios.create({name: effectiveName, title: effectiveTitle, description: scenarioDescription});
            set({selectedScenario: created});
            get().pushToast("success", get()._t("toast.scenarioCreated").replace("{name}", effectiveName));
        } else {
            const updateInput = selectedScenario.isBuiltIn
                ? {title: effectiveTitle, description: scenarioDescription}
                : {name: effectiveName, title: effectiveTitle, description: scenarioDescription};
            const updated = await agentdockClient.scenarios.update(selectedScenario.id, updateInput);
            set({selectedScenario: updated});
        }
        await get().refreshScenarios();
    },

    async deleteScenario() {
        const {selectedScenario} = get();
        if (!selectedScenario) return;
        await agentdockClient.scenarios.delete(selectedScenario.id);
        get().resetScenarioForm();
        set({view: "scenarios"});
        await get().refreshScenarios();
    },

    resetScenarioForm() {
        set({selectedScenario: null, scenarioName: "", scenarioTitle: "", scenarioDescription: "", scenarioDetailView: "view"});
    },

    setScenarioName(value) { set({scenarioName: value}); },
    setScenarioTitle(value) { set({scenarioTitle: value}); },
    setScenarioDescription(value) { set({scenarioDescription: value}); },
    setScenarioDetailView(view) { set({scenarioDetailView: view}); },
    openScenarioCreateModal() {
        get().resetScenarioForm();
        set({view: "scenarios", scenarioCreateModalOpen: true});
    },
    closeScenarioCreateModal() {
        set({scenarioCreateModalOpen: false});
    },

    openAssetPicker(field) { set({assetPickerOpen: true, assetPickerField: field}); },
    closeAssetPicker() { set({assetPickerOpen: false, assetPickerField: null}); },

    async addAssetToScenario(field, assetId) {
        const {selectedScenario} = get();
        if (!selectedScenario) return;
        await agentdockClient.scenarios.addAsset(selectedScenario.id, field, assetId);
        await get().openScenario(selectedScenario.id);
        await get().refreshScenarios();
    },

    async removeAssetFromScenario(field, assetId) {
        const {selectedScenario} = get();
        if (!selectedScenario) return;
        await agentdockClient.scenarios.removeAsset(selectedScenario.id, field, assetId);
        await get().openScenario(selectedScenario.id);
        await get().refreshScenarios();
    },

    async addAgentAppToScenario(agentId) {
        const {selectedScenario} = get();
        if (!selectedScenario) return;
        if (selectedScenario.agentAppIds.includes(agentId)) return;

        await agentdockClient.scenarios.update(selectedScenario.id, {
            agentAppIds: [...selectedScenario.agentAppIds, agentId],
        });
        await get().openScenario(selectedScenario.id);
        await get().refreshScenarios();
    },

    async removeAgentAppFromScenario(agentId) {
        const {selectedScenario} = get();
        if (!selectedScenario) return;

        await agentdockClient.scenarios.update(selectedScenario.id, {
            agentAppIds: selectedScenario.agentAppIds.filter((id) => id !== agentId),
        });
        await get().openScenario(selectedScenario.id);
        await get().refreshScenarios();
    },

    async addProjectToScenario(projectId) {
        const {selectedScenario, projects, scenarios, selectedProjectId} = get();
        if (!selectedScenario) return;

        const project = projects.find((item) => item.id === projectId);
        if (!project) return;

        if (selectedScenario.projectIds.includes(projectId) && project.defaultScenarioId === selectedScenario.id) {
            return;
        }

        const previousScenarioId = project.defaultScenarioId;
        const nextProjectIds = selectedScenario.projectIds.includes(projectId)
            ? selectedScenario.projectIds
            : [...selectedScenario.projectIds, projectId];

        await agentdockClient.scenarios.update(selectedScenario.id, {
            projectIds: nextProjectIds,
        });

        if (previousScenarioId && previousScenarioId !== selectedScenario.id) {
            const previousScenario = scenarios.find((item) => item.id === previousScenarioId);
            if (previousScenario && previousScenario.projectIds.includes(projectId)) {
                await agentdockClient.scenarios.update(previousScenario.id, {
                    projectIds: previousScenario.projectIds.filter((id) => id !== projectId),
                });
            }
        }

        const now = new Date().toISOString();
        const updatedProjects = projects.map((item) =>
            item.id === projectId
                ? {
                    ...item,
                    defaultScenarioId: selectedScenario.id,
                    updatedAt: now,
                    syncStatus: "pending",
                }
                : item
        );

        persistProjects(updatedProjects);
        set({
            projects: updatedProjects,
            selectedProjectId: selectedProjectId === projectId ? projectId : selectedProjectId,
        });

        await get().refreshScenarios();
        await get().openScenario(selectedScenario.id);
    },

    async removeProjectFromScenario(projectId) {
        const {selectedScenario, projects, selectedProjectId} = get();
        if (!selectedScenario) return;
        if (!selectedScenario.projectIds.includes(projectId)) return;

        await agentdockClient.scenarios.update(selectedScenario.id, {
            projectIds: selectedScenario.projectIds.filter((id) => id !== projectId),
        });

        const now = new Date().toISOString();
        const updatedProjects = projects.map((item) =>
            item.id === projectId
                ? {
                    ...item,
                    defaultScenarioId: item.defaultScenarioId === selectedScenario.id ? null : item.defaultScenarioId,
                    updatedAt: now,
                    syncStatus: "pending",
                }
                : item
        );

        persistProjects(updatedProjects);
        set({
            projects: updatedProjects,
            selectedProjectId,
            selectedProjectSyncPreview: null,
        });

        await get().refreshScenarios();
        await get().openScenario(selectedScenario.id);
    },

    openProject(id) {
        const project = get().projects.find((item) => item.id === id);
        if (!project) {
            return;
        }

        set({
            view: "projects",
            selectedProjectId: project.id,
            projectName: project.name,
            projectPath: project.path,
            projectDefaultScenarioId: project.defaultScenarioId,
            projectSyncMode: project.syncMode,
            projectAgentLabel: project.agentLabel,
            selectedProjectSyncPreview: null,
        });
    },

    async createProject() {
        const {
            projects,
            scenarios,
            projectName,
            projectPath,
            projectDefaultScenarioId,
            projectSyncMode,
        } = get();

        const trimmedName = projectName.trim();
        const trimmedPath = projectPath.trim();
        const now = new Date().toISOString();
        const idBase = createProjectId(trimmedName);
        let nextId = idBase;
        let duplicateIndex = 2;

        while (projects.some((project) => project.id === nextId)) {
            nextId = `${idBase}-${duplicateIndex}`;
            duplicateIndex += 1;
        }

        if (projectDefaultScenarioId) {
            const matchedScenario = scenarios.find((scenario) => scenario.id === projectDefaultScenarioId);
            if (matchedScenario && !matchedScenario.projectIds.includes(nextId)) {
                await agentdockClient.scenarios.update(matchedScenario.id, {
                    projectIds: [...matchedScenario.projectIds, nextId],
                });
                if (get().selectedScenario?.id === matchedScenario.id) {
                    await get().openScenario(matchedScenario.id);
                }
                await get().refreshScenarios();
            }
        }

        const created: ProjectRecord = {
            id: nextId,
            name: trimmedName,
            path: trimmedPath,
            defaultScenarioId: projectDefaultScenarioId,
            targetIds: [],
            syncMode: projectSyncMode,
            syncStatus: "pending",
            lastSyncedAt: null,
            agentLabel: "",
            syncHistory: [],
            createdAt: now,
            updatedAt: now,
        };

        const nextProjects = [created, ...projects];
        persistProjects(nextProjects);
        set({
            projects: nextProjects,
            selectedProjectId: created.id,
            view: "projects",
        });

        return created;
    },

    async previewProjectSync(projectId) {
        const project = get().projects.find((candidate) => candidate.id === projectId) ?? null;

        if (!project?.defaultScenarioId) {
            throw new Error(get()._t("projectSyncRequiresScenario"));
        }

        const preview = await agentdockClient.sync.preview({
            scenario_id: project.defaultScenarioId,
            target_ids: project.targetIds,
            inline_targets: buildProjectInlineSyncTargets(project),
        });

        if (get().selectedProjectId === projectId) {
            set({selectedProjectSyncPreview: preview});
        }

        return preview;
    },

    async previewSelectedProjectSync() {
        const {selectedProjectId} = get();
        if (!selectedProjectId) {
            return;
        }
        await get().previewProjectSync(selectedProjectId);
    },

    async runProjectSync(projectId) {
        const {projects} = get();
        const project = projects.find((candidate) => candidate.id === projectId) ?? null;

        if (!project?.defaultScenarioId) {
            throw new Error(get()._t("projectSyncRequiresScenario"));
        }

        if (project.syncMode === "preview-first" || get().selectedProjectId !== projectId || !get().selectedProjectSyncPreview) {
            const preview = await get().previewProjectSync(projectId);
            if (get().selectedProjectId === projectId) {
                set({selectedProjectSyncPreview: preview});
            }
        }

        const result = await agentdockClient.sync.run({
            scenario_id: project.defaultScenarioId,
            target_ids: project.targetIds,
            inline_targets: buildProjectInlineSyncTargets(project),
        });
        const historyEntry: SyncHistoryEntry = {
            id: `${project.id}-${result.synced_at}`,
            scenario_id: project.defaultScenarioId,
            synced_at: result.synced_at,
            target_count: result.target_count,
            operation_count: result.operation_count,
            written_count: result.written_count,
            warning_count: result.warnings.length,
            conflict_count: result.conflicts.length,
            status:
                result.conflicts.length > 0
                    ? "conflict"
                    : result.warnings.length > 0
                        ? "warning"
                        : "success",
            warnings: result.warnings,
            conflicts: result.conflicts,
            outputs: result.items.slice(0, 3).map((item) => ({
                asset_id: item.asset_id,
                asset_name: item.asset_name,
                asset_type: item.asset_type,
                target_id: item.target_id,
                target_name: item.target_name,
                output_path: item.output_path,
                operation: item.operation,
            })),
        };
        const nextProjects = projects.map((candidate) =>
            candidate.id === project.id
                ? {
                    ...candidate,
                    syncStatus: result.conflicts.length > 0 ? "conflict" : "synced",
                    lastSyncedAt: result.synced_at,
                    syncHistory: [historyEntry, ...candidate.syncHistory].slice(
                        0,
                        MAX_PROJECT_SYNC_HISTORY
                    ),
                    updatedAt: result.synced_at,
                }
                : candidate
        );

        persistProjects(nextProjects);
        set(
            get().selectedProjectId === projectId
                ? {
                    projects: nextProjects,
                    selectedProjectSyncPreview: result,
                }
                : {
                    projects: nextProjects,
                }
        );

        return result;
    },

    async runSelectedProjectSync() {
        const {selectedProjectId} = get();
        if (!selectedProjectId) {
            return;
        }
        await get().runProjectSync(selectedProjectId);
    },

    toggleSelectedProjectTarget(targetId) {
        const {projects, selectedProjectId} = get();
        if (!selectedProjectId) {
            return;
        }

        const now = new Date().toISOString();
        const nextProjects = projects.map((project) => {
            if (project.id !== selectedProjectId) {
                return project;
            }

            const hasTarget = project.targetIds.includes(targetId);
            return {
                ...project,
                targetIds: hasTarget
                    ? project.targetIds.filter((id) => id !== targetId)
                    : [...project.targetIds, targetId],
                syncStatus: "pending" as const,
                updatedAt: now,
            };
        });

        persistProjects(nextProjects);
        set({
            projects: nextProjects,
            selectedProjectSyncPreview: null,
        });
    },

    resetProjectForm() {
        set({
            selectedProjectId: null,
            projectName: "",
            projectPath: "",
            projectDefaultScenarioId: "default",
            projectSyncMode: "manual",
            projectAgentLabel: "",
            selectedProjectSyncPreview: null,
        });
    },

    setProjectName(value) { set({projectName: value}); },
    setProjectPath(value) { set({projectPath: value}); },
    setProjectDefaultScenarioId(value) { set({projectDefaultScenarioId: value}); },
    setProjectSyncMode(value) { set({projectSyncMode: value}); },
    setProjectAgentLabel(value) { set({projectAgentLabel: value}); },

    // ---------- targets ----------
    async refreshTargets() {
        set({targets: await agentdockClient.targets.list()});
    },

    async openTarget(id) {
        const target = await agentdockClient.targets.get(id);
        if (!target) { get().resetTargetForm(); return; }
        set({selectedTarget: target, targetName: target.name, targetPath: target.path, targetDeployMode: target.deployMode, targetEnabled: target.enabled});
    },

    async saveTarget() {
        const {selectedTarget, targetName, targetPath, targetDeployMode, targetEnabled} = get();
        if (!selectedTarget) {
            const created = await agentdockClient.targets.create({name: targetName, path: targetPath, deployMode: targetDeployMode});
            set({selectedTarget: created, targetName: created.name, targetPath: created.path, targetDeployMode: created.deployMode, targetEnabled: created.enabled});
        } else {
            const updated = await agentdockClient.targets.update(selectedTarget.id, {name: targetName, path: targetPath, enabled: targetEnabled, deployMode: targetDeployMode});
            set({selectedTarget: updated, targetName: updated.name, targetPath: updated.path, targetDeployMode: updated.deployMode, targetEnabled: updated.enabled});
        }
        await get().refreshTargets();
    },

    async deleteTarget() {
        const {selectedTarget} = get();
        if (!selectedTarget) return;
        await agentdockClient.targets.delete(selectedTarget.id);
        get().resetTargetForm();
        await get().refreshTargets();
    },

    resetTargetForm() {
        set({selectedTarget: null, targetName: "", targetPath: "", targetDeployMode: "copy", targetEnabled: true});
    },

    setTargetName(value) { set({targetName: value}); },
    setTargetPath(value) { set({targetPath: value}); },
    setTargetDeployMode(mode) { set({targetDeployMode: mode}); },
    setTargetEnabled(value) { set({targetEnabled: value}); },

    // ---------- applications (settings) ----------
    async refreshApplications() {
        set({applications: await agentdockClient.applications.list()});
    },

    async openApplication(id) {
        const detail = await agentdockClient.applications.get(id);
        set({selectedApplicationId: id});
        if (!detail) {
            set({selectedApplicationDetail: null, applicationEnabled: false, selectedLocation: null, locationName: "", locationPath: "", locationEnabled: false});
            return;
        }
        set({selectedApplicationDetail: detail, applicationEnabled: detail.application.enabled});
        const {selectedLocation} = get();
        if (selectedLocation) {
            const matched = detail.locations.find((l) => l.id === selectedLocation.id);
            if (matched) { set({selectedLocation: matched, locationName: matched.name, locationPath: matched.path, locationEnabled: matched.enabled}); return; }
        }
        set({selectedLocation: null, locationName: "", locationPath: "", locationEnabled: false});
    },

    async saveApplication() {
        const {selectedApplicationId, applicationEnabled} = get();
        if (!selectedApplicationId) return;
        await agentdockClient.applications.update(selectedApplicationId, {enabled: applicationEnabled});
        await get().refreshApplications();
        await get().openApplication(selectedApplicationId);
    },

    async detectApplicationLocations() {
        const {selectedApplicationId} = get();
        if (!selectedApplicationId) return;
        await agentdockClient.applications.refreshLocations(selectedApplicationId);
        await get().openApplication(selectedApplicationId);
    },

    async saveApplicationLocation() {
        const {selectedLocation, selectedApplicationId, locationName, locationPath, locationEnabled} = get();
        if (!selectedLocation || !selectedApplicationId) return;
        await agentdockClient.applications.updateLocation(selectedLocation.id, {name: locationName, path: locationPath, enabled: locationEnabled});
        await get().openApplication(selectedApplicationId);
    },

    async runApplicationSync() {
        const {selectedApplicationId} = get();
        if (!selectedApplicationId) return;

        const result = await agentdockClient.applications.runSync(selectedApplicationId);
        const baseMessage = get()
            ._t("settingsAgentSyncSuccess")
            .replace("{locations}", String(result.touched_locations))
            .replace("{skills}", String(result.synced_skills))
            .replace("{agentsMd}", String(result.synced_agents_md));

        if (result.conflicts.length > 0) {
            get().pushToast(
                "error",
                `${baseMessage} ${get()._t("settingsAgentSyncConflict").replace("{count}", String(result.conflicts.length))}`
            );
            return;
        }

        get().pushToast("success", baseMessage);
        await get().openApplication(selectedApplicationId);
    },

    selectLocation(location) {
        if (!location) { set({selectedLocation: null, locationName: "", locationPath: "", locationEnabled: false}); return; }
        set({selectedLocation: location, locationName: location.name, locationPath: location.path, locationEnabled: location.enabled});
    },

    setApplicationEnabled(value) { set({applicationEnabled: value}); },
    setLocationName(value) { set({locationName: value}); },
    setLocationPath(value) { set({locationPath: value}); },
    setLocationEnabled(value) { set({locationEnabled: value}); },

    setSettingsDataPath(value) {
        set({settingsDataPath: value});
        persistStoredSettings({
            dataPath: value,
            autoUpdate: get().settingsAutoUpdate,
            notifications: get().settingsNotifications,
            sound: get().settingsSound,
        });
    },

    setSettingsAutoUpdate(value) {
        set({settingsAutoUpdate: value});
        persistStoredSettings({
            dataPath: get().settingsDataPath,
            autoUpdate: value,
            notifications: get().settingsNotifications,
            sound: get().settingsSound,
        });
    },

    setSettingsNotifications(value) {
        set({settingsNotifications: value});
        persistStoredSettings({
            dataPath: get().settingsDataPath,
            autoUpdate: get().settingsAutoUpdate,
            notifications: value,
            sound: get().settingsSound,
        });
    },

    setSettingsSound(value) {
        set({settingsSound: value});
        persistStoredSettings({
            dataPath: get().settingsDataPath,
            autoUpdate: get().settingsAutoUpdate,
            notifications: get().settingsNotifications,
            sound: value,
        });
    },

    // ---------- toasts ----------
    pushToast(kind, message) {
        const id = nextToastId();
        set((s) => ({toasts: [...s.toasts, {id, kind, message}]}));
        setTimeout(() => { set((s) => ({toasts: s.toasts.filter((t) => t.id !== id)})); }, 3500);
    },

    dismissToast(id) { set((s) => ({toasts: s.toasts.filter((t) => t.id !== id)})); },

    // internal
    _t: (k: string) => k,
}));

export function bindStoreT(t: (k: string) => string): void {
    useAppStore.setState({_t: t});
}

export function getAssetTypeLabelKey(type: AssetType): string {
    return type === "skill" ? "assetTypeSkill" : type === "agents-md" ? "assetTypeAgentsMd" : "assetTypeRule";
}

export function getAssetStatusLabelKey(status: AssetStatus | string): string {
    return status === "active" ? "assetStatusActive" : status;
}

export function getDeployModeLabelKey(mode: TargetDeployMode): string {
    return mode === "copy" ? "deployModeCopy" : "deployModeMerge";
}

export function getSeverityLabelKey(severity: string): string {
    return `severity${severity.charAt(0).toUpperCase() + severity.slice(1)}` as any;
}
