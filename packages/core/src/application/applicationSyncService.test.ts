import {describe, expect, it} from "vitest";
import path from "node:path";

import {ApplicationSyncService} from "./applicationSyncService";
import type {ApplicationRepository} from "./applicationRepository";
import type {AssetRepository} from "../asset/assetRepository";
import type {ScenarioRepository} from "../scenario/scenarioRepository";
import type {ApplicationLocationRecord, ApplicationRecord} from "../types/application";
import type {AssetRecord, ScenarioRecord} from "../types/asset";
import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";

class StubApplicationRepository implements ApplicationRepository {
    constructor(
        private readonly applications: ApplicationRecord[] = [],
        private readonly locations: ApplicationLocationRecord[] = []
    ) {}

    listApplications(): ApplicationRecord[] {
        return this.applications;
    }

    findApplicationById(id: ApplicationRecord["id"]): ApplicationRecord | null {
        return this.applications.find((application) => application.id === id) ?? null;
    }

    upsertApplication(): void {}

    listLocations(applicationId: ApplicationRecord["id"]): ApplicationLocationRecord[] {
        return this.locations.filter((location) => location.application_id === applicationId);
    }

    findLocationById(id: string): ApplicationLocationRecord | null {
        return this.locations.find((location) => location.id === id) ?? null;
    }

    findLocationByKey(applicationId: ApplicationRecord["id"], locationKey: string): ApplicationLocationRecord | null {
        return this.locations.find(
            (location) => location.application_id === applicationId && location.location_key === locationKey
        ) ?? null;
    }

    createLocation(): void {}

    updateLocation(): void {}
}

class StubAssetRepository implements AssetRepository {
    constructor(private readonly assets: AssetRecord[]) {}

    list(): AssetRecord[] {
        return this.assets;
    }

    findById(id: string): AssetRecord | null {
        return this.assets.find((asset) => asset.id === id) ?? null;
    }

    create(): void {}

    updateDetails(): void {}

    touch(): void {}

    delete(): void {}
}

class StubScenarioRepository implements ScenarioRepository {
    constructor(private readonly scenarios: ScenarioRecord[]) {}

    list(): ScenarioRecord[] {
        return this.scenarios;
    }

    findById(id: string): ScenarioRecord | null {
        return this.scenarios.find((scenario) => scenario.id === id) ?? null;
    }

    create(): void {}

    update(): void {}

    delete(): void {}

    addAssetId(): void {}

    removeAssetId(): void {}

    count(): number {
        return this.scenarios.length;
    }

    findByName(name: string): ScenarioRecord | null {
        return this.scenarios.find((scenario) => scenario.name === name) ?? null;
    }
}

class StubFileSystem implements FileSystemPort {
    async exists(): Promise<boolean> {
        return false;
    }

    async readText(): Promise<string> {
        return "";
    }

    async writeText(): Promise<void> {}

    async ensureDir(): Promise<void> {}

    async copyDir(): Promise<void> {}

    async emptyDir(): Promise<void> {}

    async remove(): Promise<void> {}
}

const testPath: PathPort = {
    join: (...parts) => path.posix.join(...parts),
    isAbsolute: (candidate) => path.posix.isAbsolute(candidate),
    dirname: (candidate) => path.posix.dirname(candidate),
    basename: (candidate) => path.posix.basename(candidate),
};

const makeLocation = (overrides: Partial<ApplicationLocationRecord> = {}): ApplicationLocationRecord => ({
    id: "loc-1",
    application_id: "codex",
    location_key: "codex:project:skills",
    target_id: "target-1",
    name: "Codex Project Skills",
    kind: "skills",
    scope: "project",
    path: "/workspace",
    exists: true,
    enabled: true,
    source: "manual",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
});

const makeScenario = (overrides: Partial<ScenarioRecord> = {}): ScenarioRecord => ({
    id: "scenario-1",
    name: "default",
    title: "Default Scenario",
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

const makeAsset = (overrides: Partial<AssetRecord> = {}): AssetRecord => ({
    id: "asset-1",
    type: "skill",
    name: "asset-one",
    title: "Asset One",
    description: "",
    version: "0.1.0",
    status: "active",
    path: "/registry/asset-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
});

describe("ApplicationSyncService previewScenarioSync", () => {
    it("surfaces missing and disabled asset warnings instead of filtering them out", async () => {
        const scenario = makeScenario({
            skillIds: ["missing-skill", "disabled-skill"],
            agentFileIds: ["missing-agents"],
        });
        const service = new ApplicationSyncService({
            applicationRepository: new StubApplicationRepository([], [makeLocation()]),
            scenarioRepository: new StubScenarioRepository([scenario]),
            assetRepository: new StubAssetRepository([
                makeAsset({id: "disabled-skill", status: "disabled"}),
            ]),
            fileSystem: new StubFileSystem(),
            path: testPath,
        });

        const result = await service.previewScenarioSync("codex", scenario.id);

        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.stringContaining("missing asset: missing-skill"),
                expect.stringContaining('Disabled asset "Asset One" was skipped during sync preview.'),
                expect.stringContaining("missing asset: missing-agents"),
                expect.stringContaining("has no active Skill or AGENTS.md assets to sync to Agent locations."),
            ])
        );
    });
});
