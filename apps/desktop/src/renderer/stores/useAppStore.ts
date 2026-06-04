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
    RuleRecord,
    RuleSeverity,
    ScenarioRecord,
} from "../../../../../packages/core/src/types/asset";
import type {SnapshotRecord} from "../../../../../packages/core/src/types/snapshot";
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

export type ToastKind = "info" | "success" | "error";

export type Toast = {
    id: string;
    kind: ToastKind;
    message: string;
};

export type AssetFilter = "all" | "enabled" | "disabled";
export type AssetTypeFilter = "all" | AssetType;

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
    openAssetPicker(field: "skillIds" | "ruleIds" | "agentFileIds"): void;
    closeAssetPicker(): void;
    addAssetToScenario(field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;
    removeAssetFromScenario(field: "skillIds" | "ruleIds" | "agentFileIds", assetId: string): Promise<void>;

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
    selectLocation(location: ApplicationLocationRecord | null): void;
    setApplicationEnabled(value: boolean): void;
    setLocationName(value: string): void;
    setLocationPath(value: string): void;
    setLocationEnabled(value: boolean): void;

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
            get().pushToast("error", `Failed to open asset: ${err instanceof Error ? err.message : String(err)}`);
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
            get().pushToast("error", get()._t("toast.ruleNameRequired"));
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
        if (!scenarioName.trim()) {
            get().pushToast("error", get()._t("toast.scenarioNameRequired"));
            return;
        }
        if (!selectedScenario) {
            const created = await agentdockClient.scenarios.create({name: scenarioName, title: scenarioTitle, description: scenarioDescription});
            set({selectedScenario: created});
            get().pushToast("success", get()._t("toast.scenarioCreated").replace("{name}", scenarioName));
        } else {
            const updated = await agentdockClient.scenarios.update(selectedScenario.id, {name: scenarioName, title: scenarioTitle, description: scenarioDescription});
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

    selectLocation(location) {
        if (!location) { set({selectedLocation: null, locationName: "", locationPath: "", locationEnabled: false}); return; }
        set({selectedLocation: location, locationName: location.name, locationPath: location.path, locationEnabled: location.enabled});
    },

    setApplicationEnabled(value) { set({applicationEnabled: value}); },
    setLocationName(value) { set({locationName: value}); },
    setLocationPath(value) { set({locationPath: value}); },
    setLocationEnabled(value) { set({locationEnabled: value}); },

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