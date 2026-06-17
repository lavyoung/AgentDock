/**
 * Planner-side helpers for the sync domain.
 *
 * These helpers own the *path layout* rules that both `SyncService` and
 * `ApplicationSyncService` previously inlined. By routing all path
 * computation through this module, the two services cannot drift on
 * directory naming.
 *
 * Layout contract (Task 3 / Group C — canonical):
 *
 *   Skill:
 *     <targetRoot>/skills/<asset.id>/SKILL.md
 *
 *   AGENTS.md:
 *     <targetRoot>/AGENTS.md
 *
 * For Application-managed locations the same layout applies with
 * `targetRoot = <location.path>`. A `resolveManagedPath` helper is
 * provided for the special case of agent "skills" vs "AGENTS.md"
 * locations.
 *
 * The directory name is keyed on `asset.id` (not `asset.name`). This is the
 * canonical identity decision for Task 3 / Group C. Asset names remain
 * available for display (`asset.title || asset.name`) but the on-disk
 * identity is the stable id.
 *
 * NOTE: This is a planner-only module. It must not import from
 * `managed-block/*` or perform any file I/O. Keep all functions pure.
 */

import {getAssetMainFileName, type AssetRecord, type ScenarioRecord,} from "../types/asset";
import type {ApplicationLocationRecord} from "../types/application";
import type {PathPort} from "../ports/pathPort";
import type {SyncPlanItem, SyncHistoryOutput} from "../types/sync";
import {AGENTS_OUTPUT_FILE, SKILLS_OUTPUT_DIR} from "./syncConstants";

/**
 * Canonical skill output path.
 *
 *   <targetRoot>/skills/<asset.id>/SKILL.md
 *
 * The directory name is `asset.id` — stable across renames and
 * ASCII-friendly. Callers that need to delete a previously-synced skill
 * should `path.dirname` this result to find the folder to remove.
 */
export function resolveSkillOutputPath(
    path: PathPort,
    targetRoot: string,
    asset: Pick<AssetRecord, "id" | "type">
): string {
    return path.join(
        targetRoot,
        SKILLS_OUTPUT_DIR,
        asset.id,
        getAssetMainFileName(asset.type)
    );
}

/**
 * Canonical AGENTS.md output path.
 *
 *   <targetRoot>/AGENTS.md
 */
export function resolveAgentsMdOutputPath(
    path: PathPort,
    targetRoot: string
): string {
    return path.join(targetRoot, AGENTS_OUTPUT_FILE);
}

/**
 * Resolves the managed on-disk path for an application location.
 *
 * For `kind: "skills"` the managed root is `<location.path>/skills`.
 * For `kind: "agents-md"` it is `<location.path>/AGENTS.md` directly.
 *
 * `location.path` is the base path; the managed sub-path is appended
 * so a single agent location can address either kind.
 */
export function resolveManagedPath(
    path: PathPort,
    location: Pick<ApplicationLocationRecord, "kind" | "path">
): string {
    return location.kind === "skills"
        ? path.join(location.path, SKILLS_OUTPUT_DIR)
        : path.join(location.path, AGENTS_OUTPUT_FILE);
}

/**
 * Asset collection result used by the planner.
 */
export type CollectedAssets = {
    assets: AssetRecord[];
    warnings: string[];
    assetsById: Map<string, AssetRecord>;
};

type CollectScenarioAssetsInput = {
    scenario: Pick<ScenarioRecord, "id" | "title" | "name" | "skillIds" | "agentFileIds">;
    allAssets: AssetRecord[];
    expectedType: AssetRecord["type"];
    assetIdList: string[];
    /**
     * Warning emitted when neither skill nor AGENTS.md assets are active for
     * the scenario. Caller can choose to suppress this when the scenario
     * is being previewed across both kinds.
     */
    emptyWarning?: string;
};

/**
 * Walks the scenario's id list for the given kind, drops missing / wrong-type
 * / disabled assets, and surfaces friendly warnings.
 *
 * Shared by both `SyncService.collectScenarioAssets` and the inline
 * filtering inside `ApplicationSyncService.prepareScenarioPlan`.
 */
export function collectScenarioAssets(
    input: CollectScenarioAssetsInput
): CollectedAssets {
    const collected: AssetRecord[] = [];
    const warnings: string[] = [];
    const assetsById = new Map<string, AssetRecord>();
    const scenarioLabel = input.scenario.title || input.scenario.name;

    for (const assetId of input.assetIdList) {
        const asset = input.allAssets.find((candidate) => candidate.id === assetId);

        if (!asset) {
            warnings.push(`Scenario "${scenarioLabel}" references a missing asset: ${assetId}`);
            continue;
        }

        if (asset.type !== input.expectedType) {
            warnings.push(`Asset "${asset.title || asset.name}" is not a ${input.expectedType} asset and was skipped.`);
            continue;
        }

        if (asset.status !== "active") {
            warnings.push(`Disabled asset "${asset.title || asset.name}" was skipped during sync preview.`);
            continue;
        }

        assetsById.set(asset.id, asset);
        collected.push(asset);
    }

    if (input.emptyWarning && collected.length === 0) {
        warnings.push(input.emptyWarning);
    }

    return {assets: collected, warnings, assetsById};
}

/**
 * Build the stable identity key for a plan item. Used to compare a tracked
 * history output against the current plan.
 */
export function planItemKey(item: Pick<SyncPlanItem, "target_id" | "asset_id" | "output_path">): string {
    return `${item.target_id}:${item.asset_id}:${item.output_path}`;
}

/**
 * Build the identity key for a history output (same shape as plan item key).
 */
export function historyOutputKey(
    output: Pick<SyncHistoryOutput, "target_id" | "asset_id" | "output_path">
): string {
    return `${output.target_id}:${output.asset_id}:${output.output_path}`;
}

/**
 * Diff tracked history outputs against the current plan. Returns the items
 * that are no longer present in the plan — these are the candidates for
 * `operation: "delete"`.
 */
export function diffTrackedOutputs(
    path: PathPort,
    trackedOutputs: SyncHistoryOutput[],
    currentItemKeys: Set<string>
): SyncPlanItem[] {
    return trackedOutputs
        .filter((output) => !currentItemKeys.has(historyOutputKey(output)))
        .map((output) => ({
            asset_id: output.asset_id,
            asset_name: output.asset_name,
            asset_type: output.asset_type,
            target_id: output.target_id,
            target_name: output.target_name,
            target_root: path.dirname(output.output_path),
            output_path: output.output_path,
            operation: "delete" as const,
        }));
}
