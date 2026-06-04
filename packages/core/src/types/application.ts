export type ApplicationId =
    | "codex"
    | "claude-code"
    | "cursor"
    | "gemini-cli"
    | "copilot-cli"
    | "windsurf";

export type ApplicationLocationKind = "skills" | "agents-md";

export type ApplicationLocationScope = "global" | "project";

export type ApplicationLocationSource = "detected" | "manual";

export type ApplicationRecord = {
    id: ApplicationId;
    name: string;
    description: string;
    enabled: boolean;
    total_locations: number;
    enabled_locations: number;
    existing_locations: number;
    created_at: string;
    updated_at: string;
};

export type ApplicationLocationRecord = {
    id: string;
    application_id: ApplicationId;
    location_key: string;
    target_id: string | null;
    name: string;
    kind: ApplicationLocationKind;
    scope: ApplicationLocationScope;
    path: string;
    exists: boolean;
    enabled: boolean;
    source: ApplicationLocationSource;
    created_at: string;
    updated_at: string;
};

export type ApplicationDetail = {
    application: ApplicationRecord;
    locations: ApplicationLocationRecord[];
};

export type UpdateApplicationInput = {
    enabled?: boolean;
};

export type UpdateApplicationLocationInput = {
    name?: string;
    path?: string;
    enabled?: boolean;
};

export type ApplicationSyncConflict = {
    asset_id: string;
    location_id: string;
    reason: string;
};

export type ApplicationSyncResult = {
    application_id: ApplicationId;
    synced_skills: number;
    synced_agents_md: number;
    touched_locations: number;
    conflicts: ApplicationSyncConflict[];
    synced_at: string;
};
