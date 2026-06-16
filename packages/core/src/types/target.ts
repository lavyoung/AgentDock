/**
 * Domain types for targets.
 *
 * The transport-stable DTO definitions live in
 * `@agentdock/shared/contract/targets`. This module re-exports them so internal
 * core consumers can continue to import from `../types/target` without churn.
 */

export type {
    TargetDeployMode,
    TargetRecord,
    CreateTargetInput,
    UpdateTargetInput,
} from "@agentdock/shared/contract/targets";
