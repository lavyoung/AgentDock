import type {AgentdockApi} from "../../../../../packages/shared/src/agentdockApi";
import {
    getApplicationDefinition,
    listSupportedApplications,
} from "../../../../../packages/core/src/application/applicationCatalog";
import type {
    ApplicationDetail,
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationRecord,
} from "../../../../../packages/core/src/types/application";
import type {AssetDetail, RuleRecord, ScenarioRecord} from "../../../../../packages/core/src/types/asset";
import type {TargetRecord} from "../../../../../packages/core/src/types/target";

function getApi(): AgentdockApi | null {
    if (typeof window === "undefined") return null;
    return window.agentdock ?? null;
}

function notReady(): Promise<never> {
    return Promise.reject(
        new Error(
            "agentdock client is not available. This UI is intended to run inside the Electron desktop app."
        )
    );
}

const MOCK_MODE = import.meta.env.MODE === "mock" || !getApi();

let mockAssetCounter = 0;
const mockAssets: AssetDetail[] = [];
const mockRules: RuleRecord[] = [];
const mockScenarios: ScenarioRecord[] = [];
const mockTargets: TargetRecord[] = [];
const mockApplications = new Map<ApplicationId, boolean>(
    listSupportedApplications().map((application) => [application.id, application.id === "codex"])
);
let mockLocations: ApplicationLocationRecord[] = [];

function nowIso(): string {
    return new Date().toISOString();
}

// Bootstrap a built-in default scenario
function initMockData() {
    if (mockScenarios.length > 0) return;
    mockScenarios.push({
        id: "default",
        name: "default",
        title: "Default scenario",
        description: "Built-in default scenario with common skills and OpenCode Agent",
        skillIds: [],
        ruleIds: [],
        agentFileIds: [],
        agentAppIds: [],
        projectIds: [],
        isBuiltIn: true,
        created_at: nowIso(),
        updated_at: nowIso(),
    });
}

const mockApi: AgentdockApi = {
    app: {name: "AgentDock (browser preview)"},
    assets: {
        list: async () => mockAssets.map(({content: _c, ...rest}) => rest),
        get: async (id) => mockAssets.find((a) => a.id === id) ?? null,
        create: async (input) => {
            mockAssetCounter += 1;
            const id = `mock-asset-${mockAssetCounter}`;
            const record: AssetDetail = {
                id,
                type: input.type,
                name: input.name,
                title: input.title ?? input.name,
                description: input.description ?? "",
                version: "0.1.0",
                status: "active",
                path: `/mock/${input.name}`,
                created_at: nowIso(),
                updated_at: nowIso(),
                content: input.content,
            };
            mockAssets.push(record);
            const {content: _c, ...rest} = record;
            return rest;
        },
        update: async (id, input) => {
            const idx = mockAssets.findIndex((a) => a.id === id);
            if (idx < 0) return null;
            const next: AssetDetail = {
                ...mockAssets[idx],
                title: input.title ?? mockAssets[idx].title,
                description: input.description ?? mockAssets[idx].description,
                content: input.content ?? mockAssets[idx].content,
                status: input.status ?? mockAssets[idx].status,
                updated_at: nowIso(),
            };
            mockAssets[idx] = next;
            return next;
        },
        setStatus: async (id, status) => {
            const idx = mockAssets.findIndex((a) => a.id === id);
            if (idx < 0) return null;
            mockAssets[idx] = {...mockAssets[idx], status, updated_at: nowIso()};
            const {content: _c, ...rest} = mockAssets[idx];
            return rest;
        },
        delete: async (id) => {
            const idx = mockAssets.findIndex((a) => a.id === id);
            if (idx >= 0) {
                mockAssets.splice(idx, 1);
            }
            return {deleted: true, asset_id: id};
        },
    },
    rules: {
        list: async () => [...mockRules],
        get: async (id) => mockRules.find((r) => r.id === id) ?? null,
        create: async (input) => {
            const id = `mock-rule-${mockRules.length + 1}`;
            const record: RuleRecord = {
                id,
                name: input.name,
                title: input.title ?? input.name,
                description: input.description ?? "",
                severity: input.severity,
                enabled: input.enabled ?? true,
                created_at: nowIso(),
                updated_at: nowIso(),
            };
            mockRules.push(record);
            return record;
        },
        update: async (id, input) => {
            const idx = mockRules.findIndex((r) => r.id === id);
            if (idx < 0) throw new Error("Rule not found");
            const next: RuleRecord = {
                ...mockRules[idx],
                ...input,
                updated_at: nowIso(),
            };
            mockRules[idx] = next;
            return next;
        },
        delete: async (id) => {
            const idx = mockRules.findIndex((r) => r.id === id);
            if (idx >= 0) mockRules.splice(idx, 1);
            return {deleted: true, rule_id: id};
        },
    },
    snapshots: {
        list: async () => [],
        restore: async (snapshotId) => ({
            restored: true,
            asset_id: "mock-asset",
            snapshot_id: snapshotId,
        }),
    },
    targets: {
        list: async () => mockTargets,
        get: async (id) => mockTargets.find((t) => t.id === id) ?? null,
        create: async (input) => {
            const record: TargetRecord = {
                id: `mock-t-${mockTargets.length + 1}`,
                name: input.name,
                path: input.path,
                deployMode: input.deployMode,
                enabled: true,
                created_at: nowIso(),
                updated_at: nowIso(),
            };
            mockTargets.push(record);
            return record;
        },
        update: async (id, input) => {
            const idx = mockTargets.findIndex((t) => t.id === id);
            if (idx < 0) throw new Error("Target not found");
            const next: TargetRecord = {
                ...mockTargets[idx],
                name: input.name ?? mockTargets[idx].name,
                path: input.path ?? mockTargets[idx].path,
                enabled: input.enabled ?? mockTargets[idx].enabled,
                deployMode: input.deployMode ?? mockTargets[idx].deployMode,
                updated_at: nowIso(),
            };
            mockTargets[idx] = next;
            return next;
        },
        delete: async (id) => {
            const idx = mockTargets.findIndex((t) => t.id === id);
            if (idx >= 0) mockTargets.splice(idx, 1);
            return {deleted: true, target_id: id};
        },
    },
    scenarios: {
        list: async () => {
            initMockData();
            return [...mockScenarios];
        },
        get: async (id) => {
            initMockData();
            return mockScenarios.find((s) => s.id === id) ?? null;
        },
        create: async (input) => {
            initMockData();
            const id = `mock-scenario-${mockScenarios.length + 1}`;
            const record: ScenarioRecord = {
                id,
                name: input.name,
                title: input.title ?? input.name,
                description: input.description ?? "",
                skillIds: [],
                ruleIds: [],
                agentFileIds: [],
                agentAppIds: [],
                projectIds: [],
                isBuiltIn: false,
                created_at: nowIso(),
                updated_at: nowIso(),
            };
            mockScenarios.push(record);
            return record;
        },
        update: async (id, input) => {
            initMockData();
            const idx = mockScenarios.findIndex((s) => s.id === id);
            if (idx < 0) throw new Error("Scenario not found");
            const next: ScenarioRecord = {
                ...mockScenarios[idx],
                ...input,
                updated_at: nowIso(),
            };
            mockScenarios[idx] = next;
            return next;
        },
        delete: async (id) => {
            initMockData();
            const idx = mockScenarios.findIndex((s) => s.id === id);
            if (idx >= 0) mockScenarios.splice(idx, 1);
            return {deleted: true, scenario_id: id};
        },
        addAsset: async (scenarioId, field, assetId) => {
            initMockData();
            const idx = mockScenarios.findIndex((s) => s.id === scenarioId);
            if (idx < 0) return;
            if (!mockScenarios[idx][field].includes(assetId)) {
                mockScenarios[idx][field].push(assetId);
                mockScenarios[idx].updated_at = nowIso();
            }
        },
        removeAsset: async (scenarioId, field, assetId) => {
            initMockData();
            const idx = mockScenarios.findIndex((s) => s.id === scenarioId);
            if (idx < 0) return;
            mockScenarios[idx][field] = mockScenarios[idx][field].filter((id) => id !== assetId);
            mockScenarios[idx].updated_at = nowIso();
        },
    },
    applications: {
        list: async () =>
            listSupportedApplications().map((application): ApplicationRecord => {
                const locations = mockLocations.filter(
                    (location) => location.application_id === application.id
                );
                return {
                    id: application.id,
                    name: application.name,
                    description: application.description,
                    enabled: mockApplications.get(application.id) ?? false,
                    total_locations: locations.length,
                    enabled_locations: locations.filter((location) => location.enabled).length,
                    existing_locations: locations.filter((location) => location.exists).length,
                    created_at: nowIso(),
                    updated_at: nowIso(),
                };
            }),
        get: async (id) => {
            const definition = getApplicationDefinition(id);
            const detail: ApplicationDetail = {
                application: {
                    id: definition.id,
                    name: definition.name,
                    description: definition.description,
                    enabled: mockApplications.get(id) ?? false,
                    total_locations: mockLocations.filter((location) => location.application_id === id).length,
                    enabled_locations: mockLocations.filter(
                        (location) => location.application_id === id && location.enabled
                    ).length,
                    existing_locations: mockLocations.filter(
                        (location) => location.application_id === id && location.exists
                    ).length,
                    created_at: nowIso(),
                    updated_at: nowIso(),
                },
                locations: mockLocations.filter((location) => location.application_id === id),
            };
            return detail;
        },
        update: async (id, input) => {
            if (input.enabled !== undefined) {
                mockApplications.set(id, input.enabled);
            }
            const definition = getApplicationDefinition(id);
            return {
                id,
                name: definition.name,
                description: definition.description,
                enabled: mockApplications.get(id) ?? false,
                total_locations: mockLocations.filter((location) => location.application_id === id).length,
                enabled_locations: mockLocations.filter(
                    (location) => location.application_id === id && location.enabled
                ).length,
                existing_locations: mockLocations.filter(
                    (location) => location.application_id === id && location.exists
                ).length,
                created_at: nowIso(),
                updated_at: nowIso(),
            };
        },
        refreshLocations: async (id) => mockLocations.filter((location) => location.application_id === id),
        updateLocation: async (id, input) => {
            const idx = mockLocations.findIndex((l) => l.id === id);
            if (idx < 0) throw new Error("Location not found");
            const next = {
                ...mockLocations[idx],
                name: input.name ?? mockLocations[idx].name,
                path: input.path ?? mockLocations[idx].path,
                enabled: input.enabled ?? mockLocations[idx].enabled,
                updated_at: nowIso(),
            };
            mockLocations[idx] = next;
            return next;
        },
    },
};

export const agentdockClient: AgentdockApi = MOCK_MODE ? mockApi : new Proxy({} as AgentdockApi, {
    get(_target, prop: keyof AgentdockApi) {
        const api = getApi();
        if (!api) {
            return {
                app: {name: "AgentDock"},
                assets: {list: notReady, get: notReady, create: notReady, update: notReady, setStatus: notReady, delete: notReady},
                rules: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady},
                snapshots: {list: notReady, restore: notReady},
                targets: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady},
                scenarios: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady, addAsset: notReady, removeAsset: notReady},
                applications: {list: notReady, get: notReady, update: notReady, refreshLocations: notReady, updateLocation: notReady},
            }[prop];
        }
        return api[prop];
    },
});
