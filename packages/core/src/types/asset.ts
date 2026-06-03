export type AssetType = "skill" | "agents-md" | "rule";

export type AssetStatus = "active" | "disabled";

export type RuleSeverity = "error" | "warning" | "info";

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

export function getAssetMainFileName(type: AssetType): string {
    if (type === "skill") return "SKILL.md";
    if (type === "agents-md") return "AGENTS.md";
    return "rule.yaml";
}

export function getSeverityColor(severity: RuleSeverity): string {
    switch (severity) {
        case "error": return "#ef4444";
        case "warning": return "#f59e0b";
        case "info": return "#3b82f6";
    }
}

export function getSeverityBg(severity: RuleSeverity): string {
    switch (severity) {
        case "error": return "rgba(239,68,68,.15)";
        case "warning": return "rgba(245,158,11,.15)";
        case "info": return "rgba(59,130,246,.15)";
    }
}