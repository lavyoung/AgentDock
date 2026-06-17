/**
 * Executor-side helpers for the sync domain.
 *
 * These helpers own the *write/read/remove* mechanics that both
 * `SyncService` and `ApplicationSyncService` previously inlined. By routing
 * the I/O through this module the two services share a single
 * implementation of:
 *
 *   - asset content read (`readAssetContent`)
 *   - skill bundle write (`writeSkillOutput`)
 *   - AGENTS.md managed-block write (`writeAgentsMdMerge`)
 *   - AGENTS.md managed-block removal (`removeAgentsMdBlock`)
 *   - skill output removal (`removeSkillOutput`)
 *
 * All helpers take a `FileSystemPort` + `PathPort` so they remain
 * platform-agnostic. They never import from `managed-block/*` directly —
 * the merge is invoked through the public `mergeManagedBlock` /
 * `removeManagedBlock` exports and any future pure-function contract
 * change is surfaced once, not twice.
 */

import {getAssetMainFileName, type AssetRecord} from "../types/asset";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import {mergeManagedBlock} from "../managed-block/mergeManagedBlock";
import {removeManagedBlock} from "../managed-block/removeManagedBlock";
import {resolveSkillOutputPath} from "./syncPlannerHelpers";

/**
 * Result type for an AGENTS.md merge write. Mirrors the shape both
 * `SyncService` and `ApplicationSyncService` already produced; preserved
 * here so the public method signatures do not break.
 */
export type AgentsMdWriteResult =
    | {status: "ok"; content: string}
    | {status: "conflict"; reason: string};

/**
 * Read the canonical current content of an asset.
 *
 * Layout: `<asset.path>/current/<mainFile>`. This is the same on-disk
 * contract that `AssetService.createAsset` / `updateAsset` produce.
 */
export function readAssetContent(
    fileSystem: FileSystemPort,
    path: PathPort,
    asset: AssetRecord
): Promise<string> {
    return fileSystem.readText(
        path.join(asset.path, "current", getAssetMainFileName(asset.type))
    );
}

/**
 * Write a single skill asset to the canonical output location.
 *
 * Resolves the path via `resolveSkillOutputPath`, ensures the per-asset
 * directory exists, and writes the main file. Does not touch the file
 * system outside that scope.
 */
export async function writeSkillOutput(
    fileSystem: FileSystemPort,
    path: PathPort,
    targetRoot: string,
    asset: AssetRecord
): Promise<void> {
    const content = await readAssetContent(fileSystem, path, asset);
    const outputPath = resolveSkillOutputPath(path, targetRoot, asset);
    const assetDir = path.dirname(outputPath);
    await fileSystem.ensureDir(assetDir);
    await fileSystem.writeText(outputPath, content);
}

/**
 * Merge a single asset's content into an AGENTS.md file at the given path.
 *
 * Behavior:
 *   - If the file does not exist, a new managed block is appended.
 *   - If a managed block already exists for this asset, it is updated
 *     in place; surrounding user content is preserved.
 *   - If the markers are inconsistent (e.g. truncated / duplicated),
 *     a `conflict` result is returned and the file is left untouched.
 *
 * `outputPath` is the exact path the file should be written to. The
 * caller is responsible for resolving the path (see
 * `resolveAgentsMdOutputPath` / `resolveManagedPath`).
 */
export async function writeAgentsMdMerge(
    fileSystem: FileSystemPort,
    path: PathPort,
    outputPath: string,
    asset: AssetRecord
): Promise<AgentsMdWriteResult> {
    await fileSystem.ensureDir(path.dirname(outputPath));
    const originalContent = (await fileSystem.exists(outputPath))
        ? await fileSystem.readText(outputPath)
        : "";
    const content = await readAssetContent(fileSystem, path, asset);
    const merged = mergeManagedBlock({
        originalContent,
        assetId: asset.id,
        version: asset.version,
        generatedContent: content,
    });

    if (merged.status === "conflict") {
        return {status: "conflict", reason: merged.reason};
    }

    await fileSystem.writeText(outputPath, merged.content);
    return {status: "ok", content: merged.content};
}

/**
 * Merge a sequence of assets into a single AGENTS.md file by chaining the
 * merge results. Used by `ApplicationSyncService.syncAgentsMdLocation` so
 * that multiple AGENTS.md assets can stack into one file.
 *
 * If any merge returns a conflict, the file is left untouched and the
 * conflict is surfaced to the caller (with the offending `assetId`).
 */
export async function writeAgentsMdMerges(
    fileSystem: FileSystemPort,
    path: PathPort,
    outputPath: string,
    assets: AssetRecord[]
): Promise<{status: "ok"} | {status: "conflict"; assetId: string; reason: string}> {
    await fileSystem.ensureDir(path.dirname(outputPath));
    const originalContent = (await fileSystem.exists(outputPath))
        ? await fileSystem.readText(outputPath)
        : "";
    let nextContent = originalContent;

    for (const asset of assets) {
        const content = await readAssetContent(fileSystem, path, asset);
        const merged = mergeManagedBlock({
            originalContent: nextContent,
            assetId: asset.id,
            version: asset.version,
            generatedContent: content,
        });

        if (merged.status === "conflict") {
            return {status: "conflict", assetId: asset.id, reason: merged.reason};
        }

        nextContent = merged.content;
    }

    if (nextContent === originalContent) {
        return {status: "ok"};
    }

    await fileSystem.writeText(outputPath, nextContent);
    return {status: "ok"};
}

/**
 * Remove a previously-synced skill output by removing its containing
 * directory.
 *
 * Layout: `<targetRoot>/skills/<asset.id>/SKILL.md`, so `path.dirname`
 * of the output path is the per-asset folder. Removing the folder
 * cleans up SKILL.md and any other side files the user dropped in.
 */
export async function removeSkillOutput(
    fileSystem: FileSystemPort,
    path: PathPort,
    outputPath: string
): Promise<void> {
    await fileSystem.remove(path.dirname(outputPath));
}

/**
 * Remove a managed block from an AGENTS.md file.
 *
 * Behavior:
 *   - If the file does not exist, returns `ok` (nothing to do).
 *   - If the asset's managed block is present, the block is removed and
 *     the file is rewritten. Whitespace is normalized to two trailing
 *     newlines.
 *   - If the markers are inconsistent, returns `conflict` and the file
 *     is left untouched.
 */
export async function removeAgentsMdBlock(
    fileSystem: FileSystemPort,
    outputPath: string,
    assetId: string
): Promise<{status: "ok"} | {status: "conflict"; reason: string}> {
    if (!(await fileSystem.exists(outputPath))) {
        return {status: "ok"};
    }

    const originalContent = await fileSystem.readText(outputPath);
    const removed = removeManagedBlock({originalContent, assetId});

    if (removed.status === "conflict") {
        return {status: "conflict", reason: removed.reason};
    }

    if (removed.status === "noop") {
        return {status: "ok"};
    }

    await fileSystem.writeText(outputPath, removed.content);
    return {status: "ok"};
}
