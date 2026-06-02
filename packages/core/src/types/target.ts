export type TargetDeployMode = "copy" | "merge";

export type TargetRecord = {
    id: string;
    name: string;
    path: string;
    enabled: boolean;
    deployMode: TargetDeployMode;
    created_at: string;
    updated_at: string;
};

export type CreateTargetInput = {
    name: string;
    path: string;
    deployMode: TargetDeployMode;
};

export type UpdateTargetInput = {
    name?: string;
    path?: string;
    enabled?: boolean;
    deployMode?: TargetDeployMode;
};
