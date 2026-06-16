/**
 * Transport contract types for targets.
 *
 * `TargetDeployMode` is defined here because it appears on the wire surface
 * (`AgentdockApi.targets.*`) as well as being referenced by sync inline
 * targets. Core keeps its own copy in `packages/core/src/types/target.ts`; the
 * two must stay in sync.
 */

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