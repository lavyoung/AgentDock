/**
 * Domain types for assets.
 *
 * The transport-stable DTO definitions live in
 * `@agentdock/shared/contract/assets`. This module re-exports them so internal
 * core consumers can continue to import from `../types/asset` without churn,
 * and keeps the runtime helpers (`getAssetMainFileName`, severity colors)
 * that depend on these domain types.
 *
 * NOTE: Do not add new domain logic to this file in this refactor round.
 * Keep the surface identical to the previous version so internal imports
 * remain stable.
 */

import type {
    AssetType as ContractAssetType,
    RuleSeverity as ContractRuleSeverity,
} from "@agentdock/shared/contract/assets";

export type {
    AssetType,
    AssetStatus,
    RuleSeverity,
    AssetRecord,
    AssetDetail,
    CreateAssetInput,
    UpdateAssetInput,
    RuleRecord,
    ScenarioRecord,
} from "@agentdock/shared/contract/assets";

export function getAssetMainFileName(type: ContractAssetType): string {
    if (type === "skill") return "SKILL.md";
    if (type === "agents-md") return "AGENTS.md";
    return "rule.yaml";
}

export function getSeverityColor(severity: ContractRuleSeverity): string {
    switch (severity) {
        case "error": return "#ef4444";
        case "warning": return "#f59e0b";
        case "info": return "#3b82f6";
    }
}

export function getSeverityBg(severity: ContractRuleSeverity): string {
    switch (severity) {
        case "error": return "rgba(239,68,68,.15)";
        case "warning": return "rgba(245,158,11,.15)";
        case "info": return "rgba(59,130,246,.15)";
    }
}
