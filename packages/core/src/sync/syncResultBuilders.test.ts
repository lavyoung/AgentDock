import {describe, expect, it} from "vitest";

import type {SyncPlanItem} from "../types/sync";
import {
    buildApplicationSyncConflict,
    buildPreviewResult,
    buildSyncRunConflict,
    countOperations,
} from "./syncResultBuilders";

const makeItem = (overrides: Partial<SyncPlanItem> = {}): SyncPlanItem => ({
    asset_id: "asset-1",
    asset_name: "Asset One",
    asset_type: "skill",
    target_id: "tgt-1",
    target_name: "Project",
    target_root: "/t",
    output_path: "/t/skills/asset-1/SKILL.md",
    operation: "create",
    ...overrides,
});

describe("countOperations", () => {
    it("returns zero for an empty plan", () => {
        expect(countOperations([])).toEqual({
            create: 0,
            update: 0,
            merge: 0,
            delete: 0,
        });
    });

    it("counts each kind independently", () => {
        const items: SyncPlanItem[] = [
            makeItem({operation: "create"}),
            makeItem({operation: "create"}),
            makeItem({operation: "update"}),
            makeItem({operation: "merge"}),
            makeItem({operation: "merge"}),
            makeItem({operation: "merge"}),
            makeItem({operation: "delete"}),
        ];

        expect(countOperations(items)).toEqual({
            create: 2,
            update: 1,
            merge: 3,
            delete: 1,
        });
    });
});

describe("buildPreviewResult", () => {
    it("produces scenario_id / target_count / operation_count / per-kind counts", () => {
        const items: SyncPlanItem[] = [
            makeItem({operation: "create"}),
            makeItem({operation: "update"}),
            makeItem({operation: "merge"}),
            makeItem({operation: "delete"}),
        ];

        const result = buildPreviewResult({
            scenarioId: "scenario-1",
            targetCount: 2,
            items,
            warnings: ["w1"],
        });

        expect(result).toEqual({
            scenario_id: "scenario-1",
            target_count: 2,
            operation_count: 4,
            create_count: 1,
            update_count: 1,
            merge_count: 1,
            delete_count: 1,
            warnings: ["w1"],
            items,
        });
    });
});

describe("buildSyncRunConflict", () => {
    it("copies asset_id, target, output_path, and reason from the inputs", () => {
        const item = makeItem({
            asset_id: "asset-1",
            asset_type: "agents-md",
            output_path: "/t/AGENTS.md",
        });

        const conflict = buildSyncRunConflict({
            item,
            target: {id: "tgt-1", name: "Project"},
            reason: "marker mismatch",
        });

        expect(conflict).toEqual({
            asset_id: "asset-1",
            asset_name: "Asset One",
            asset_type: "agents-md",
            target_id: "tgt-1",
            target_name: "Project",
            output_path: "/t/AGENTS.md",
            reason: "marker mismatch",
        });
    });

    it("honors the optional assetName override", () => {
        const item = makeItem({asset_name: "old display"});

        const conflict = buildSyncRunConflict({
            item,
            target: {id: "tgt-1", name: "Project"},
            reason: "boom",
            assetName: "preferred display",
        });

        expect(conflict.asset_name).toBe("preferred display");
    });
});

describe("buildApplicationSyncConflict", () => {
    it("produces the agent-side shape expected by the contract", () => {
        const conflict = buildApplicationSyncConflict({
            asset: {id: "asset-1"},
            location: {id: "loc-1", name: "Codex Project Skills"},
            reason: "marker mismatch",
        });

        expect(conflict).toEqual({
            asset_id: "asset-1",
            location_id: "loc-1",
            reason: "marker mismatch",
        });
    });
});
