/**
 * Transport contract types for assets.
 *
 * These DTOs describe the wire format used by `AgentdockApi.assets.*` and the
 * composition types that flow through scenario/sync contracts. They must stay
 * free of runtime imports (no functions, no Electron, no Node-only types) so
 * the shared package has zero dependency on `@agentdock/core`.
 *
 * NOTE: `AssetType`, `AssetStatus`, and `RuleSeverity` are also defined in
 * `packages/core/src/types/asset.ts` because the core domain owns the canonical
 * enum strings. The two definitions must stay in sync. The contract copy is
 * the transport-stable one; the core copy is the domain one.
 */

export type AssetType = "skill" | "agents-md" | "rule";

export type AssetStatus = "active" | "disabled";

export type RuleSeverity = "error" | "warning" | "info";

export type AssetRecord = {
    id: string;
    type: AssetType;
    name: string;
    title: string;
    description: string;
    version: string;
    status: AssetStatus;
    path: string;
    created_at: string;
    updated_at: string;
};

export type AssetDetail = AssetRecord & {
    content: string;
};

export type CreateAssetInput = {
    type: AssetType;
    name: string;
    title?: string;
    description?: string;
    content: string;
};

export type UpdateAssetInput = {
    title?: string;
    description?: string;
    content?: string;
    status?: AssetStatus;
};

export type RuleRecord = {
    id: string;
    name: string;
    title: string;
    description: string;
    severity: RuleSeverity;
    enabled: boolean;
    created_at: string;
    updated_at: string;
};

export type ScenarioRecord = {
    id: string;
    name: string;
    title: string;
    description: string;
    skillIds: string[];
    ruleIds: string[];
    agentFileIds: string[];
    agentAppIds: string[];
    projectIds: string[];
    isBuiltIn: boolean;
    created_at: string;
    updated_at: string;
};