/**
 * Domain types for applications and their managed locations.
 *
 * The transport-stable DTO definitions live in
 * `@agentdock/shared/contract/applications`. This module re-exports them so
 * internal core consumers can continue to import from `../types/application`
 * without churn.
 */

export type {
    ApplicationId,
    ApplicationLocationKind,
    ApplicationLocationScope,
    ApplicationLocationSource,
    ApplicationRecord,
    ApplicationLocationRecord,
    ApplicationDetail,
    UpdateApplicationInput,
    UpdateApplicationLocationInput,
    ApplicationSyncConflict,
    ApplicationSyncResult,
} from "@agentdock/shared/contract/applications";
