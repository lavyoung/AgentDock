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
import type {
    SyncCleanupInput,
    SyncCleanupResult,
    SyncPreviewInput,
    SyncPreviewResult,
    SyncRunResult,
} from "../../../../../packages/core/src/types/sync";
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

function buildMockSyncPreview(input: SyncPreviewInput): SyncPreviewResult {
    initMockData();
    const scenario = mockScenarios.find((candidate) => candidate.id === input.scenario_id);

    if (!scenario) {
        throw new Error(`Scenario not found: ${input.scenario_id}`);
    }

    const targets = mockTargets.filter((target) =>
        target.enabled && (input.target_ids === undefined || input.target_ids.includes(target.id))
    );
    const inlineTargets = (input.inline_targets ?? []).map((target) => ({
        id: target.id,
        name: target.name,
        path: target.path,
        deployMode: target.deployMode,
        enabled: true,
        created_at: nowIso(),
        updated_at: nowIso(),
    }));
    const resolvedTargets = [...targets, ...inlineTargets].filter(
        (target, index, list) => list.findIndex((candidate) => candidate.id === target.id) === index
    );
    const warnings: string[] = [];

    if (resolvedTargets.length === 0) {
        warnings.push("No sync destinations are available for this scenario.");
    }

    const activeSkillAssets = scenario.skillIds
        .map((assetId) => mockAssets.find((asset) => asset.id === assetId) ?? null)
        .filter((asset): asset is AssetDetail => Boolean(asset) && asset.type === "skill" && asset.status === "active");
    const activeAgentsMdAssets = scenario.agentFileIds
        .map((assetId) => mockAssets.find((asset) => asset.id === assetId) ?? null)
        .filter((asset): asset is AssetDetail => Boolean(asset) && asset.type === "agents-md" && asset.status === "active");

    if (activeSkillAssets.length === 0 && activeAgentsMdAssets.length === 0) {
        warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync.`);
    }

    const items = resolvedTargets.flatMap((target) => {
        const skillItems = activeSkillAssets
            .map((asset) => ({
                asset_id: asset.id,
                asset_name: asset.title || asset.name,
                asset_type: asset.type,
                target_id: target.id,
                target_name: target.name,
                target_root: target.path,
                output_path: `${target.path}\\skills\\${asset.id}\\SKILL.md`,
                operation: "create" as const,
            }));
        const agentsMdItems = activeAgentsMdAssets
            .map((asset) => ({
                asset_id: asset.id,
                asset_name: asset.title || asset.name,
                asset_type: asset.type,
                target_id: target.id,
                target_name: target.name,
                target_root: target.path,
                output_path: `${target.path}\\AGENTS.md`,
                operation: "merge" as const,
            }));

        return [...skillItems, ...agentsMdItems];
    });
    const currentKeys = new Set(
        items.map((item) => `${item.target_id}:${item.asset_id}:${item.output_path}`)
    );
    const deleteItems = (input.tracked_outputs ?? [])
        .filter((output) => !currentKeys.has(`${output.target_id}:${output.asset_id}:${output.output_path}`))
        .map((output) => ({
            asset_id: output.asset_id,
            asset_name: output.asset_name,
            asset_type: output.asset_type,
            target_id: output.target_id,
            target_name: output.target_name,
            target_root: output.output_path,
            output_path: output.output_path,
            operation: "delete" as const,
        }));
    const allItems = [...items, ...deleteItems];

    return {
        scenario_id: scenario.id,
        target_count: resolvedTargets.length,
        operation_count: allItems.length,
        create_count: allItems.filter((item) => item.operation === "create").length,
        update_count: 0,
        merge_count: allItems.filter((item) => item.operation === "merge").length,
        delete_count: allItems.filter((item) => item.operation === "delete").length,
        warnings,
        items: allItems,
    };
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
    app: {
        name: "AgentDock (browser preview)",
        pickPath: async (input) => {
            if (input.mode === "agents-md-file") {
                return input.defaultPath?.trim() || "D:\\Mock\\Workspace\\AGENTS.md";
            }

            return input.defaultPath?.trim() || "D:\\Mock\\Workspace";
        },
    },
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
            if (field === "agentFileIds") {
                mockScenarios[idx][field] = [assetId];
                mockScenarios[idx].updated_at = nowIso();
                return;
            }
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
            const existingLocations = mockLocations.filter(
                (location) => location.application_id === id && location.exists
            );

            if (input.enabled === true && existingLocations.length === 0) {
                throw new Error("Application is not installed and cannot be enabled.");
            }

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
        runSync: async (id) => ({
            application_id: id,
            synced_skills: mockAssets.filter((asset) => asset.type === "skill" && asset.status === "active").length,
            synced_agents_md: mockAssets.filter((asset) => asset.type === "agents-md" && asset.status === "active").length,
            touched_locations: mockLocations.filter((location) => location.application_id === id && location.enabled).length,
            conflicts: [],
            synced_at: nowIso(),
        }),
        previewScenarioSync: async (id, scenarioId) => {
            const scenario = mockScenarios.find((candidate) => candidate.id === scenarioId);
            if (!scenario) {
                throw new Error(`Scenario not found: ${scenarioId}`);
            }
            const locations = mockLocations.filter(
                (location) => location.application_id === id && location.enabled
            );
            const activeSkillAssets = mockAssets.filter(
                (asset) => asset.type === "skill" && asset.status === "active" && scenario.skillIds.includes(asset.id)
            );
            const activeAgentsMdAssets = mockAssets.filter(
                (asset) => asset.type === "agents-md" && asset.status === "active" && scenario.agentFileIds.includes(asset.id)
            );
            const warnings: string[] = [];

            if (locations.length === 0) {
                warnings.push(`No enabled managed locations are configured for ${id}.`);
            }

            if (activeSkillAssets.length === 0 && activeAgentsMdAssets.length === 0) {
                warnings.push(`Scenario "${scenario.title || scenario.name}" has no active Skill or AGENTS.md assets to sync to Agent locations.`);
            }

            const items = locations.flatMap((location) => {
                if (location.kind === "skills") {
                    return activeSkillAssets.map((asset) => ({
                        asset_id: asset.id,
                        asset_name: asset.title || asset.name,
                        asset_type: asset.type,
                        target_id: location.id,
                        target_name: location.name,
                        target_root: location.path,
                        output_path: `${location.path}\\skills\\${asset.name}\\SKILL.md`,
                        operation: "create" as const,
                    }));
                }

                return activeAgentsMdAssets.map((asset) => ({
                    asset_id: asset.id,
                    asset_name: asset.title || asset.name,
                    asset_type: asset.type,
                    target_id: location.id,
                    target_name: location.name,
                    target_root: location.path,
                    output_path: `${location.path}\\AGENTS.md`,
                    operation: "merge" as const,
                }));
            });

            return {
                scenario_id: scenarioId,
                target_count: locations.length,
                operation_count: items.length,
                create_count: items.filter((item) => item.operation === "create").length,
                update_count: 0,
                merge_count: items.filter((item) => item.operation === "merge").length,
                delete_count: 0,
                warnings,
                items,
            };
        },
        runScenarioSync: async (id, scenarioId) => {
            const preview = await mockApi.applications.previewScenarioSync(id, scenarioId);
            return {
                ...preview,
                written_count: preview.operation_count,
                conflicts: [],
                synced_at: nowIso(),
            };
        },
    },
    sync: {
        preview: async (input) => buildMockSyncPreview(input),
        run: async (input): Promise<SyncRunResult> => ({
            ...buildMockSyncPreview(input),
            written_count: buildMockSyncPreview(input).operation_count,
            conflicts: [],
            synced_at: nowIso(),
        }),
        cleanup: async (input: SyncCleanupInput): Promise<SyncCleanupResult> => ({
            cleaned_count: input.tracked_outputs.length,
            conflict_count: 0,
            warnings: input.tracked_outputs.length === 0 ? ["No tracked outputs were available to clean."] : [],
            conflicts: [],
            cleaned_at: nowIso(),
        }),
    },
};

export const agentdockClient: AgentdockApi = MOCK_MODE ? mockApi : new Proxy({} as AgentdockApi, {
    get(_target, prop: keyof AgentdockApi) {
        const api = getApi();
        if (!api) {
            return {
                app: {name: "AgentDock", pickPath: notReady},
                assets: {list: notReady, get: notReady, create: notReady, update: notReady, setStatus: notReady, delete: notReady},
                rules: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady},
                snapshots: {list: notReady, restore: notReady},
                targets: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady},
                scenarios: {list: notReady, get: notReady, create: notReady, update: notReady, delete: notReady, addAsset: notReady, removeAsset: notReady},
                applications: {
                    list: notReady,
                    get: notReady,
                    update: notReady,
                    refreshLocations: notReady,
                    updateLocation: notReady,
                    runSync: notReady,
                    previewScenarioSync: notReady,
                    runScenarioSync: notReady,
                },
                sync: {preview: notReady, run: notReady, cleanup: notReady},
            }[prop];
        }
        return api[prop];
    },
});
