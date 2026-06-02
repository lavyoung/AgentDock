import {nanoid} from "nanoid";

import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {TargetRepository} from "../target/targetRepository";
import type {
    ApplicationDetail,
    ApplicationId,
    ApplicationLocationKind,
    ApplicationLocationRecord,
    ApplicationRecord,
    UpdateApplicationInput,
    UpdateApplicationLocationInput,
} from "../types/application";
import type {ApplicationRepository} from "./applicationRepository";

type ApplicationServiceDependencies = {
    applicationRepository: ApplicationRepository;
    fileSystem: FileSystemPort;
    homeDir: string;
    path: PathPort;
    targetRepository: TargetRepository;
};

const DEFAULT_APPLICATIONS: Record<ApplicationId, Pick<ApplicationRecord, "id" | "name">> = {
    codex: {
        id: "codex",
        name: "Codex",
    },
};

export class ApplicationService {
    private readonly applicationRepository: ApplicationRepository;
    private readonly fileSystem: FileSystemPort;
    private readonly homeDir: string;
    private readonly path: PathPort;
    private readonly targetRepository: TargetRepository;

    constructor(dependencies: ApplicationServiceDependencies) {
        this.applicationRepository = dependencies.applicationRepository;
        this.fileSystem = dependencies.fileSystem;
        this.homeDir = dependencies.homeDir;
        this.path = dependencies.path;
        this.targetRepository = dependencies.targetRepository;
    }

    listApplications(): ApplicationRecord[] {
        const existing = new Map(
            this.applicationRepository
                .listApplications()
                .map((application) => [application.id, application])
        );

        return Object.values(DEFAULT_APPLICATIONS).map((defaults) => {
            return existing.get(defaults.id) ?? this.buildDefaultApplication(defaults.id);
        });
    }

    getApplication(id: ApplicationId): ApplicationDetail | null {
        const application = this.getResolvedApplication(id);

        if (!application) {
            return null;
        }

        return {
            application,
            locations: this.listLocations(id),
        };
    }

    updateApplication(
        id: ApplicationId,
        input: UpdateApplicationInput
    ): ApplicationRecord {
        const current = this.ensureApplication(id);
        const next: ApplicationRecord = {
            ...current,
            enabled: input.enabled ?? current.enabled,
            updated_at: new Date().toISOString(),
        };

        this.applicationRepository.upsertApplication(next);

        return next;
    }

    async refreshLocations(id: ApplicationId): Promise<ApplicationLocationRecord[]> {
        const application = this.ensureApplication(id);
        const detected = await this.detectLocations(application.id);
        const now = new Date().toISOString();
        const nextKeys = new Set(detected.map((location) => location.location_key));
        const existingLocations = this.applicationRepository.listLocations(id);

        for (const location of detected) {
            const current = this.applicationRepository.findLocationByKey(
                id,
                location.location_key
            );

            if (!current) {
                this.applicationRepository.createLocation(location);
                continue;
            }

            if (current.source === "manual") {
                continue;
            }

            this.applicationRepository.updateLocation({
                ...current,
                name: location.name,
                path: location.path,
                exists: location.exists,
                target_id: location.target_id,
                updated_at: now,
            });
        }

        for (const location of existingLocations) {
            if (location.source !== "detected" || nextKeys.has(location.location_key)) {
                continue;
            }

            this.applicationRepository.updateLocation({
                ...location,
                exists: false,
                enabled: false,
                updated_at: now,
            });
        }

        return this.listLocations(id);
    }

    async updateLocation(
        id: string,
        input: UpdateApplicationLocationInput
    ): Promise<ApplicationLocationRecord> {
        const current = this.applicationRepository.findLocationById(id);

        if (!current) {
            throw new Error(`Application location not found: ${id}`);
        }

        const nextPath = input.path?.trim() ?? current.path;
        const nextName = input.name?.trim() ?? current.name;

        if (!nextName) {
            throw new Error("Application location name is required.");
        }

        if (!nextPath) {
            throw new Error("Application location path is required.");
        }

        if (!this.path.isAbsolute(nextPath)) {
            throw new Error("Application location path must be an absolute path.");
        }

        const next: ApplicationLocationRecord = {
            ...current,
            name: nextName,
            path: nextPath,
            exists: await this.fileSystem.exists(nextPath),
            enabled: input.enabled ?? current.enabled,
            source:
                input.name !== undefined || input.path !== undefined
                    ? "manual"
                    : current.source,
            updated_at: new Date().toISOString(),
        };

        this.applicationRepository.updateLocation(next);

        return next;
    }

    private async detectLocations(
        applicationId: ApplicationId
    ): Promise<ApplicationLocationRecord[]> {
        switch (applicationId) {
            case "codex":
                return this.detectCodexLocations();
        }
    }

    private async detectCodexLocations(): Promise<ApplicationLocationRecord[]> {
        const now = new Date().toISOString();
        const locations: ApplicationLocationRecord[] = [];
        const globalSkillsPath = this.path.join(this.homeDir, ".codex", "skills");

        locations.push({
            id: nanoid(),
            application_id: "codex",
            location_key: "codex:global:skills",
            target_id: null,
            name: "Codex Global Skills",
            kind: "skills",
            scope: "global",
            path: globalSkillsPath,
            exists: await this.fileSystem.exists(globalSkillsPath),
            enabled: false,
            source: "detected",
            created_at: now,
            updated_at: now,
        });

        for (const target of this.targetRepository.list()) {
            const projectSkillsPath = this.path.join(target.path, ".codex", "skills");
            const projectAgentsPath = this.path.join(target.path, "AGENTS.md");

            locations.push(
                this.buildDetectedProjectLocation({
                    targetId: target.id,
                    targetName: target.name,
                    kind: "skills",
                    path: projectSkillsPath,
                    exists: await this.fileSystem.exists(projectSkillsPath),
                    now,
                })
            );
            locations.push(
                this.buildDetectedProjectLocation({
                    targetId: target.id,
                    targetName: target.name,
                    kind: "agents-md",
                    path: projectAgentsPath,
                    exists: await this.fileSystem.exists(projectAgentsPath),
                    now,
                })
            );
        }

        return locations;
    }

    private buildDetectedProjectLocation(input: {
        exists: boolean;
        kind: ApplicationLocationKind;
        now: string;
        path: string;
        targetId: string;
        targetName: string;
    }): ApplicationLocationRecord {
        return {
            id: nanoid(),
            application_id: "codex",
            location_key: `codex:project:${input.targetId}:${input.kind}`,
            target_id: input.targetId,
            name:
                input.kind === "skills"
                    ? `${input.targetName} Codex Skills`
                    : `${input.targetName} Project AGENTS.md`,
            kind: input.kind,
            scope: "project",
            path: input.path,
            exists: input.exists,
            enabled: false,
            source: "detected",
            created_at: input.now,
            updated_at: input.now,
        };
    }

    private listLocations(applicationId: ApplicationId): ApplicationLocationRecord[] {
        return this.applicationRepository
            .listLocations(applicationId)
            .sort((left, right) => {
                if (left.scope !== right.scope) {
                    return left.scope === "global" ? -1 : 1;
                }

                if (left.kind !== right.kind) {
                    return left.kind === "skills" ? -1 : 1;
                }

                return left.name.localeCompare(right.name);
            });
    }

    private ensureApplication(id: ApplicationId): ApplicationRecord {
        const existing = this.applicationRepository.findApplicationById(id);

        if (existing) {
            return existing;
        }

        const created = this.buildDefaultApplication(id);
        this.applicationRepository.upsertApplication(created);

        return created;
    }

    private getResolvedApplication(id: ApplicationId): ApplicationRecord | null {
        return (
            this.applicationRepository.findApplicationById(id) ??
            (DEFAULT_APPLICATIONS[id] ? this.buildDefaultApplication(id) : null)
        );
    }

    private buildDefaultApplication(id: ApplicationId): ApplicationRecord {
        const now = new Date().toISOString();
        const defaults = DEFAULT_APPLICATIONS[id];

        return {
            id: defaults.id,
            name: defaults.name,
            enabled: false,
            created_at: now,
            updated_at: now,
        };
    }
}
