export type AssetType = "skill" | "agents-md";
export type AssetStatus = "active";

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
};

export function getAssetMainFileName(type: AssetType): string {
    return type === "skill" ? "SKILL.md" : "AGENTS.md";
}
