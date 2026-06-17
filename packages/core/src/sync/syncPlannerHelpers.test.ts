import {describe, expect, it} from "vitest";

import type {AssetRecord, ScenarioRecord} from "../types/asset";
import type {PathPort} from "../ports/pathPort";
import {
    collectScenarioAssets,
    diffTrackedOutputs,
    historyOutputKey,
    planItemKey,
    resolveAgentsMdOutputPath,
    resolveManagedPath,
    resolveSkillOutputPath,
} from "./syncPlannerHelpers";

/**
 * Minimal `PathPort` shim that delegates to the host's `path` module
 * (POSIX-style for test determinism).
 */
import path from "node:path";

const testPath: PathPort = {
    join: (...parts) => path.posix.join(...parts),
    isAbsolute: (p) => path.posix.isAbsolute(p),
    dirname: (p) => path.posix.dirname(p),
    basename: (p) => path.posix.basename(p),
};

const makeAsset = (overrides: Partial<AssetRecord> = {}): AssetRecord => ({
    id: "asset-1",
    name: "asset-one",
    title: "Asset One",
    type: "skill",
    description: "",
    version: "0.1.0",
    status: "active",
    path: "/registry/asset-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
});

const makeScenario = (overrides: Partial<ScenarioRecord> = {}): ScenarioRecord => ({
    id: "scenario-1",
    name: "scenario-one",
    title: "Scenario One",
    description: "",
    skillIds: [],
    ruleIds: [],
    agentFileIds: [],
    agentAppIds: [],
    projectIds: [],
    isBuiltIn: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
});

describe("syncPlannerHelpers — path rules", () => {
    it("resolveSkillOutputPath keys the directory on asset.id (canonical)", () => {
        const asset = makeAsset({id: "review", name: "Display Name With Spaces"});

        const outputPath = resolveSkillOutputPath(testPath, "/targets/proj", asset);

        expect(outputPath).toBe("/targets/proj/skills/review/SKILL.md");
    });

    it("resolveSkillOutputPath ignores asset.name even when it differs from id", () => {
        const asset = makeAsset({id: "stable-id", name: "unstable name"});

        const outputPath = resolveSkillOutputPath(testPath, "/t", asset);

        expect(outputPath).toContain("stable-id");
        expect(outputPath).not.toContain("unstable name");
    });

    it("resolveAgentsMdOutputPath always lands at <root>/AGENTS.md", () => {
        expect(resolveAgentsMdOutputPath(testPath, "/t")).toBe("/t/AGENTS.md");
    });

    it("resolveManagedPath routes skills to a skills/ subfolder", () => {
        const path = resolveManagedPath(testPath, {
            kind: "skills",
            path: "/agents",
        });

        expect(path).toBe("/agents/skills");
    });

    it("resolveManagedPath routes agents-md directly to AGENTS.md", () => {
        const path = resolveManagedPath(testPath, {
            kind: "agents-md",
            path: "/agents",
        });

        expect(path).toBe("/agents/AGENTS.md");
    });
});

describe("syncPlannerHelpers — collectScenarioAssets", () => {
    it("drops missing assets and surfaces a warning", () => {
        const scenario = makeScenario({skillIds: ["missing-id"]});

        const result = collectScenarioAssets({
            scenario,
            allAssets: [],
            expectedType: "skill",
            assetIdList: scenario.skillIds,
        });

        expect(result.assets).toEqual([]);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain("missing asset");
        expect(result.warnings[0]).toContain("missing-id");
    });

    it("drops assets whose type does not match", () => {
        const scenario = makeScenario({skillIds: ["a1"]});
        const allAssets = [makeAsset({id: "a1", type: "agents-md"})];

        const result = collectScenarioAssets({
            scenario,
            allAssets,
            expectedType: "skill",
            assetIdList: scenario.skillIds,
        });

        expect(result.assets).toEqual([]);
        expect(result.warnings[0]).toContain("not a skill");
    });

    it("drops disabled assets", () => {
        const scenario = makeScenario({skillIds: ["a1"]});
        const allAssets = [makeAsset({id: "a1", status: "disabled"})];

        const result = collectScenarioAssets({
            scenario,
            allAssets,
            expectedType: "skill",
            assetIdList: scenario.skillIds,
        });

        expect(result.assets).toEqual([]);
        expect(result.warnings[0]).toContain("Disabled");
    });

    it("keeps active assets of the matching type and indexes them by id", () => {
        const scenario = makeScenario({skillIds: ["a1", "a2"]});
        const allAssets = [
            makeAsset({id: "a1", type: "skill", status: "active"}),
            makeAsset({id: "a2", type: "skill", status: "active"}),
            makeAsset({id: "a3", type: "skill", status: "active"}),
        ];

        const result = collectScenarioAssets({
            scenario,
            allAssets,
            expectedType: "skill",
            assetIdList: scenario.skillIds,
        });

        expect(result.assets.map((a) => a.id)).toEqual(["a1", "a2"]);
        expect(result.assetsById.get("a1")?.id).toBe("a1");
        expect(result.assetsById.get("a3")).toBeUndefined();
        expect(result.warnings).toEqual([]);
    });
});

describe("syncPlannerHelpers — plan/history keys", () => {
    it("planItemKey and historyOutputKey produce the same string for the same triple", () => {
        const item = {
            target_id: "tgt-1",
            asset_id: "asset-1",
            output_path: "/t/skills/asset-1/SKILL.md",
        };

        const output = {
            target_id: "tgt-1",
            asset_id: "asset-1",
            output_path: "/t/skills/asset-1/SKILL.md",
        };

        expect(planItemKey(item)).toBe(historyOutputKey(output));
    });

    it("planItemKey differs when any field changes", () => {
        const base = {
            target_id: "tgt-1",
            asset_id: "asset-1",
            output_path: "/t/skills/asset-1/SKILL.md",
        };

        expect(planItemKey(base)).not.toBe(planItemKey({...base, target_id: "tgt-2"}));
        expect(planItemKey(base)).not.toBe(planItemKey({...base, asset_id: "asset-2"}));
        expect(planItemKey(base)).not.toBe(
            planItemKey({...base, output_path: "/t/skills/asset-1/other.md"})
        );
    });
});

describe("syncPlannerHelpers — diffTrackedOutputs", () => {
    it("returns delete items only for outputs not present in the current plan", () => {
        const tracked = [
            {
                asset_id: "asset-1",
                asset_name: "Asset One",
                asset_type: "skill" as const,
                target_id: "tgt-1",
                target_name: "Project",
                output_path: "/t/skills/asset-1/SKILL.md",
                operation: "update" as const,
            },
            {
                asset_id: "asset-old",
                asset_name: "Asset Old",
                asset_type: "skill" as const,
                target_id: "tgt-1",
                target_name: "Project",
                output_path: "/t/skills/asset-old/SKILL.md",
                operation: "update" as const,
            },
        ];
        const currentItemKeys = new Set([historyOutputKey(tracked[0])]);

        const deletes = diffTrackedOutputs(testPath, tracked, currentItemKeys);

        expect(deletes).toHaveLength(1);
        expect(deletes[0].asset_id).toBe("asset-old");
        expect(deletes[0].operation).toBe("delete");
        expect(deletes[0].target_root).toBe(testPath.dirname(tracked[1].output_path));
    });

    it("returns an empty list when the plan fully covers the tracked outputs", () => {
        const tracked = [
            {
                asset_id: "asset-1",
                asset_name: "Asset One",
                asset_type: "skill" as const,
                target_id: "tgt-1",
                target_name: "Project",
                output_path: "/t/skills/asset-1/SKILL.md",
                operation: "create" as const,
            },
        ];
        const currentItemKeys = new Set([historyOutputKey(tracked[0])]);

        expect(diffTrackedOutputs(testPath, tracked, currentItemKeys)).toEqual([]);
    });
});
