import {nanoid} from "nanoid";

import {getApplicationDefinition, listSupportedApplications,} from "./applicationCatalog";
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

        return listSupportedApplications().map((definition) => {
            return this.withLocationStats(
                this.mergeWithDefaults(existing.get(definition.id), definition.id)
            );
        });
    }

    getApplication(id: ApplicationId): ApplicationDetail | null {
        const application = this.getResolvedApplication(id);

        if (!application) {
            return null;
        }

        return {
            application: this.withLocationStats(application),
            locations: this.listLocations(id),
        };
    }

    updateApplication(
        id: ApplicationId,
        input: UpdateApplicationInput
    ): ApplicationRecord {
        const current = this.ensureApplication(id);
        const currentWithStats = this.withLocationStats(current);

        if (input.enabled === true && currentWithStats.existing_locations === 0) {
            throw new Error("Application is not installed and cannot be enabled.");
        }

        const next: ApplicationRecord = {
            ...current,
            enabled: input.enabled ?? current.enabled,
            updated_at: new Date().toISOString(),
        };

        this.applicationRepository.upsertApplication(next);

        return next;
    }

    private withLocationStats(application: ApplicationRecord): ApplicationRecord {
        const locations = this.listLocations(application.id);

        return {
            ...application,
            total_locations: locations.length,
            enabled_locations: locations.filter((location) => location.enabled).length,
            existing_locations: locations.filter((location) => location.exists).length,
        };
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
                const normalizedCurrent = this.normalizeLocationBasePath(current);
                this.applicationRepository.updateLocation({
                    ...normalizedCurrent,
                    exists: await this.locationExists(normalizedCurrent),
                    updated_at: now,
                });
                continue;
            }

            this.applicationRepository.updateLocation({
                ...this.normalizeLocationBasePath(current),
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

        const now = new Date().toISOString();
        const basePath = this.normalizeBasePathForKind(current.kind, nextPath);
        const siblingLocations = this.applicationRepository
            .listLocations(current.application_id)
            .filter((location) => location.scope === current.scope && location.target_id === current.target_id);
        let updatedLocation = current;

        for (const location of siblingLocations) {
            const next: ApplicationLocationRecord = {
                ...location,
                name: location.id === current.id ? nextName : location.name,
                path: basePath,
                exists: await this.locationExists({...location, path: basePath}),
                enabled: location.id === current.id ? input.enabled ?? current.enabled : location.enabled,
                source:
                    input.name !== undefined || input.path !== undefined
                        ? "manual"
                        : location.source,
                updated_at: now,
            };

            this.applicationRepository.updateLocation(next);

            if (location.id === current.id) {
                updatedLocation = next;
            }
        }

        return updatedLocation;
    }

    private async detectLocations(
        applicationId: ApplicationId
    ): Promise<ApplicationLocationRecord[]> {
        return this.detectLocationsForApplication(applicationId);
    }

    private async detectLocationsForApplication(
        applicationId: ApplicationId
    ): Promise<ApplicationLocationRecord[]> {
        const definition = getApplicationDefinition(applicationId);
        const now = new Date().toISOString();
        const locations: ApplicationLocationRecord[] = [];
        const globalSkillsPath = this.path.join(
            this.homeDir,
            ...definition.globalSkillSegments.slice(0, -1)
        );

        locations.push({
            id: nanoid(),
            application_id: applicationId,
            location_key: `${applicationId}:global:skills`,
            target_id: null,
            name: `${definition.name} Global Skills`,
            kind: "skills",
            scope: "global",
            path: globalSkillsPath,
            exists: await this.locationExists({
                id: "detected-global",
                application_id: applicationId,
                location_key: `${applicationId}:global:skills`,
                target_id: null,
                name: `${definition.name} Global Skills`,
                kind: "skills",
                scope: "global",
                path: globalSkillsPath,
                exists: false,
                enabled: false,
                source: "detected",
                created_at: now,
                updated_at: now,
            }),
            enabled: false,
            source: "detected",
            created_at: now,
            updated_at: now,
        });

        for (const target of this.targetRepository.list()) {
            for (const kind of definition.projectSupports) {
                const projectPath = this.path.join(
                    target.path,
                    ...definition.projectSkillSegments.slice(0, -1)
                );

                locations.push(
                    this.buildDetectedProjectLocation({
                        applicationId,
                        applicationName: definition.name,
                        targetId: target.id,
                        targetName: target.name,
                        kind,
                        path: projectPath,
                        exists: await this.locationExists({
                            id: "detected-project",
                            application_id: applicationId,
                            location_key: `${applicationId}:project:${target.id}:${kind}`,
                            target_id: target.id,
                            name: `${target.name} ${definition.name} ${kind}`,
                            kind,
                            scope: "project",
                            path: projectPath,
                            exists: false,
                            enabled: false,
                            source: "detected",
                            created_at: now,
                            updated_at: now,
                        }),
                        now,
                    })
                );
            }
        }

        return locations;
    }

    private buildDetectedProjectLocation(input: {
        applicationId: ApplicationId;
        applicationName: string;
        exists: boolean;
        kind: ApplicationLocationKind;
        now: string;
        path: string;
        targetId: string;
        targetName: string;
    }): ApplicationLocationRecord {
        return {
            id: nanoid(),
            application_id: input.applicationId,
            location_key: `${input.applicationId}:project:${input.targetId}:${input.kind}`,
            target_id: input.targetId,
            name:
                input.kind === "skills"
                    ? `${input.targetName} ${input.applicationName} Skills`
                    : `${input.targetName} ${input.applicationName} AGENTS.md`,
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
            .map((location) => this.normalizeLocationBasePath(location))
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
            return this.mergeWithDefaults(existing, id);
        }

        const created = this.buildDefaultApplication(id);
        this.applicationRepository.upsertApplication(created);

        return created;
    }

    private getResolvedApplication(id: ApplicationId): ApplicationRecord | null {
        const existing = this.applicationRepository.findApplicationById(id);
        return this.mergeWithDefaults(existing, id);
    }

    private buildDefaultApplication(id: ApplicationId): ApplicationRecord {
        const now = new Date().toISOString();
        const defaults = getApplicationDefinition(id);

        return {
            id: defaults.id,
            name: defaults.name,
            description: defaults.description,
            enabled: false,
            total_locations: 0,
            enabled_locations: 0,
            existing_locations: 0,
            created_at: now,
            updated_at: now,
        };
    }

    private mergeWithDefaults(
        existing: ApplicationRecord | null | undefined,
        id: ApplicationId
    ): ApplicationRecord {
        const defaults = getApplicationDefinition(id);

        if (!existing) {
            return this.buildDefaultApplication(id);
        }

        return {
            ...existing,
            id,
            name: defaults.name,
            description: defaults.description,
        };
    }

    private normalizeLocationBasePath(location: ApplicationLocationRecord): ApplicationLocationRecord {
        const normalizedPath = this.normalizeBasePathForKind(location.kind, location.path);

        if (normalizedPath === location.path) {
            return location;
        }

        return {
            ...location,
            path: normalizedPath,
        };
    }

    private normalizeBasePathForKind(
        kind: ApplicationLocationKind,
        candidatePath: string
    ): string {
        const trimmedPath = candidatePath.trim();

        if (!trimmedPath) {
            return trimmedPath;
        }

        const baseName = this.path.basename(trimmedPath).toLowerCase();

        if (kind === "skills" && baseName === "skills") {
            return this.path.dirname(trimmedPath);
        }

        if (kind === "agents-md" && baseName === "agents.md") {
            return this.path.dirname(trimmedPath);
        }

        return trimmedPath;
    }

    private resolveManagedPath(
        kind: ApplicationLocationKind,
        basePath: string
    ): string {
        return kind === "skills"
            ? this.path.join(basePath, "skills")
            : this.path.join(basePath, "AGENTS.md");
    }

    private locationExists(location: ApplicationLocationRecord): Promise<boolean> {
        return this.fileSystem.exists(
            this.resolveManagedPath(
                location.kind,
                this.normalizeBasePathForKind(location.kind, location.path)
            )
        );
    }
}
