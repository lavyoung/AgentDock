import Database from "better-sqlite3";

import type {ApplicationRepository} from "../../../../../packages/core/src/application/applicationRepository";
import type {AssetRepository} from "../../../../../packages/core/src/asset/assetRepository";
import type {RuleRepository} from "../../../../../packages/core/src/rules/ruleRepository";
import type {ScenarioRepository} from "../../../../../packages/core/src/scenario/scenarioRepository";
import type {SnapshotRepository} from "../../../../../packages/core/src/snapshot/snapshotRepository";
import type {TargetRepository} from "../../../../../packages/core/src/target/targetRepository";
import type {
    ApplicationId,
    ApplicationLocationRecord,
    ApplicationRecord,
} from "../../../../../packages/core/src/types/application";
import type {AssetRecord, RuleRecord, ScenarioRecord} from "../../../../../packages/core/src/types/asset";
import type {SnapshotRecord} from "../../../../../packages/core/src/types/snapshot";
import type {TargetRecord} from "../../../../../packages/core/src/types/target";
import {getDbPath} from "./paths";

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
    if (!db) {
        db = new Database(getDbPath());
        db.pragma("journal_mode = WAL");
    }

    return db;
}

export function migrateDatabase(): void {
    const database = getDatabase();

    database.exec(`
        CREATE TABLE IF NOT EXISTS assets
        (
            id          TEXT PRIMARY KEY,
            type        TEXT NOT NULL,
            name        TEXT NOT NULL,
            title       TEXT,
            description TEXT,
            version     TEXT,
            status      TEXT,
            path        TEXT NOT NULL,
            created_at  TEXT,
            updated_at  TEXT
        );

        CREATE TABLE IF NOT EXISTS targets
        (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            path        TEXT NOT NULL,
            enabled     INTEGER DEFAULT 1,
            deploy_mode TEXT    DEFAULT 'copy',
            created_at  TEXT,
            updated_at  TEXT
        );

        CREATE TABLE IF NOT EXISTS applications
        (
            id         TEXT PRIMARY KEY,
            name       TEXT NOT NULL,
            enabled    INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS application_locations
        (
            id            TEXT PRIMARY KEY,
            application_id TEXT NOT NULL,
            location_key  TEXT NOT NULL UNIQUE,
            target_id     TEXT,
            name          TEXT NOT NULL,
            kind          TEXT NOT NULL,
            scope         TEXT NOT NULL,
            path          TEXT NOT NULL,
            exists_flag   INTEGER DEFAULT 0,
            enabled       INTEGER DEFAULT 0,
            source        TEXT NOT NULL,
            created_at    TEXT,
            updated_at    TEXT
        );

        CREATE TABLE IF NOT EXISTS asset_targets
        (
            asset_id       TEXT NOT NULL,
            target_id      TEXT NOT NULL,
            enabled        INTEGER DEFAULT 0,
            sync_status    TEXT    DEFAULT 'off',
            last_synced_at TEXT,
            last_checksum  TEXT,
            PRIMARY KEY (asset_id, target_id)
        );

        CREATE TABLE IF NOT EXISTS snapshots
        (
            id            TEXT PRIMARY KEY,
            asset_id      TEXT NOT NULL,
            snapshot_path TEXT NOT NULL,
            message       TEXT,
            created_at    TEXT
        );

        CREATE TABLE IF NOT EXISTS scenarios
        (
            id            TEXT PRIMARY KEY,
            name          TEXT NOT NULL,
            title         TEXT NOT NULL,
            description   TEXT,
            skill_ids     TEXT    DEFAULT '[]',
            rule_ids      TEXT    DEFAULT '[]',
            agent_file_ids TEXT   DEFAULT '[]',
            agent_app_ids TEXT    DEFAULT '[]',
            project_ids   TEXT    DEFAULT '[]',
            is_built_in   INTEGER DEFAULT 0,
            created_at    TEXT,
            updated_at    TEXT
        );

        CREATE TABLE IF NOT EXISTS rules
        (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT,
            severity    TEXT NOT NULL,
            enabled     INTEGER DEFAULT 1,
            created_at  TEXT,
            updated_at  TEXT
        );
    `);

    // Bootstrap a built-in default scenario if none exists
    const count = database
        .prepare(`SELECT COUNT(*) as c FROM scenarios`)
        .get() as {c: number};

    if (count.c === 0) {
        const now = new Date().toISOString();
        database
            .prepare(
                `
                    INSERT INTO scenarios (id,
                                           name,
                                           title,
                                           description,
                                           skill_ids,
                                           rule_ids,
                                           agent_file_ids,
                                           agent_app_ids,
                                           project_ids,
                                           is_built_in,
                                           created_at,
                                           updated_at)
                    VALUES (?, ?, ?, ?, '[]', '[]', '[]', '[]', '[]', 1, ?, ?)
                `
            )
            .run(
                "default",
                "default",
                "Default scenario",
                "Built-in default scenario with common skills and OpenCode Agent",
                now,
                now
            );
    }
}

class SqliteAssetRepository implements AssetRepository {
    private readonly database: Database.Database;
    private readonly deleteAssetTransaction: (id: string) => void;

    constructor(database: Database.Database) {
        this.database = database;
        this.deleteAssetTransaction = this.database.transaction((id: string) => {
            this.database
                .prepare(
                    `
                        DELETE
                        FROM asset_targets
                        WHERE asset_id = ?
                    `
                )
                .run(id);
            this.database
                .prepare(
                    `
                        DELETE
                        FROM snapshots
                        WHERE asset_id = ?
                    `
                )
                .run(id);
            this.database
                .prepare(
                    `
                        DELETE
                        FROM assets
                        WHERE id = ?
                    `
                )
                .run(id);
        });
    }

    list(): AssetRecord[] {
        return this.database
            .prepare(
                `
                    SELECT id,
                           type,
                           name,
                           title,
                           description,
                           version,
                           status,
                           path,
                           created_at,
                           updated_at
                    FROM assets
                    ORDER BY updated_at DESC
                `
            )
            .all() as AssetRecord[];
    }

    findById(id: string): AssetRecord | null {
        return (
            (this.database
                .prepare(
                    `
                        SELECT id,
                               type,
                               name,
                               title,
                               description,
                               version,
                               status,
                               path,
                               created_at,
                               updated_at
                        FROM assets
                        WHERE id = ?
                    `
                )
                .get(id) as AssetRecord | undefined) ?? null
        );
    }

    create(asset: AssetRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO assets (id,
                                        type,
                                        name,
                                        title,
                                        description,
                                        version,
                                        status,
                                        path,
                                        created_at,
                                        updated_at)
                    VALUES (@id,
                            @type,
                            @name,
                            @title,
                            @description,
                            @version,
                            @status,
                            @path,
                            @created_at,
                            @updated_at)
                `
            )
            .run(asset);
    }

    updateDetails(
        id: string,
        changes: Pick<AssetRecord, "title" | "description" | "status" | "updated_at">
    ): void {
        this.database
            .prepare(
                `
                    UPDATE assets
                    SET title       = @title,
                        description = @description,
                        status      = @status,
                        updated_at  = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id,
                ...changes,
            });
    }

    touch(id: string, updatedAt: string): void {
        this.database
            .prepare(
                `
                    UPDATE assets
                    SET updated_at = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id,
                updated_at: updatedAt,
            });
    }

    delete(id: string): void {
        this.deleteAssetTransaction(id);
    }
}

class SqliteApplicationRepository implements ApplicationRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
    }

    listApplications(): ApplicationRecord[] {
        const rows = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           enabled,
                           created_at,
                           updated_at
                    FROM applications
                    ORDER BY name ASC
                `
            )
            .all() as Array<{
            id: ApplicationId;
            name: string;
            enabled: number;
            created_at: string;
            updated_at: string;
        }>;

        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            enabled: row.enabled === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    }

    findApplicationById(id: ApplicationId): ApplicationRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           enabled,
                           created_at,
                           updated_at
                    FROM applications
                    WHERE id = ?
                `
            )
            .get(id) as
            | {
                  id: ApplicationId;
                  name: string;
                  enabled: number;
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            name: row.name,
            enabled: row.enabled === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    upsertApplication(application: ApplicationRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO applications (id,
                                              name,
                                              enabled,
                                              created_at,
                                              updated_at)
                    VALUES (@id,
                            @name,
                            @enabled,
                            @created_at,
                            @updated_at)
                    ON CONFLICT(id) DO UPDATE SET
                        name = excluded.name,
                        enabled = excluded.enabled,
                        updated_at = excluded.updated_at
                `
            )
            .run({
                id: application.id,
                name: application.name,
                enabled: application.enabled ? 1 : 0,
                created_at: application.created_at,
                updated_at: application.updated_at,
            });
    }

    listLocations(applicationId: ApplicationId): ApplicationLocationRecord[] {
        const rows = this.database
            .prepare(
                `
                    SELECT id,
                           application_id,
                           location_key,
                           target_id,
                           name,
                           kind,
                           scope,
                           path,
                           exists_flag,
                           enabled,
                           source,
                           created_at,
                           updated_at
                    FROM application_locations
                    WHERE application_id = ?
                    ORDER BY updated_at DESC
                `
            )
            .all(applicationId) as Array<{
            id: string;
            application_id: ApplicationId;
            location_key: string;
            target_id: string | null;
            name: string;
            kind: ApplicationLocationRecord["kind"];
            scope: ApplicationLocationRecord["scope"];
            path: string;
            exists_flag: number;
            enabled: number;
            source: ApplicationLocationRecord["source"];
            created_at: string;
            updated_at: string;
        }>;

        return rows.map((row) => ({
            id: row.id,
            application_id: row.application_id,
            location_key: row.location_key,
            target_id: row.target_id,
            name: row.name,
            kind: row.kind,
            scope: row.scope,
            path: row.path,
            exists: row.exists_flag === 1,
            enabled: row.enabled === 1,
            source: row.source,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    }

    findLocationById(id: string): ApplicationLocationRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           application_id,
                           location_key,
                           target_id,
                           name,
                           kind,
                           scope,
                           path,
                           exists_flag,
                           enabled,
                           source,
                           created_at,
                           updated_at
                    FROM application_locations
                    WHERE id = ?
                `
            )
            .get(id) as
            | {
                  id: string;
                  application_id: ApplicationId;
                  location_key: string;
                  target_id: string | null;
                  name: string;
                  kind: ApplicationLocationRecord["kind"];
                  scope: ApplicationLocationRecord["scope"];
                  path: string;
                  exists_flag: number;
                  enabled: number;
                  source: ApplicationLocationRecord["source"];
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            application_id: row.application_id,
            location_key: row.location_key,
            target_id: row.target_id,
            name: row.name,
            kind: row.kind,
            scope: row.scope,
            path: row.path,
            exists: row.exists_flag === 1,
            enabled: row.enabled === 1,
            source: row.source,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    findLocationByKey(
        applicationId: ApplicationId,
        locationKey: string
    ): ApplicationLocationRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           application_id,
                           location_key,
                           target_id,
                           name,
                           kind,
                           scope,
                           path,
                           exists_flag,
                           enabled,
                           source,
                           created_at,
                           updated_at
                    FROM application_locations
                    WHERE application_id = ?
                      AND location_key = ?
                `
            )
            .get(applicationId, locationKey) as
            | {
                  id: string;
                  application_id: ApplicationId;
                  location_key: string;
                  target_id: string | null;
                  name: string;
                  kind: ApplicationLocationRecord["kind"];
                  scope: ApplicationLocationRecord["scope"];
                  path: string;
                  exists_flag: number;
                  enabled: number;
                  source: ApplicationLocationRecord["source"];
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            application_id: row.application_id,
            location_key: row.location_key,
            target_id: row.target_id,
            name: row.name,
            kind: row.kind,
            scope: row.scope,
            path: row.path,
            exists: row.exists_flag === 1,
            enabled: row.enabled === 1,
            source: row.source,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    createLocation(location: ApplicationLocationRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO application_locations (id,
                                                       application_id,
                                                       location_key,
                                                       target_id,
                                                       name,
                                                       kind,
                                                       scope,
                                                       path,
                                                       exists_flag,
                                                       enabled,
                                                       source,
                                                       created_at,
                                                       updated_at)
                    VALUES (@id,
                            @application_id,
                            @location_key,
                            @target_id,
                            @name,
                            @kind,
                            @scope,
                            @path,
                            @exists_flag,
                            @enabled,
                            @source,
                            @created_at,
                            @updated_at)
                `
            )
            .run({
                id: location.id,
                application_id: location.application_id,
                location_key: location.location_key,
                target_id: location.target_id,
                name: location.name,
                kind: location.kind,
                scope: location.scope,
                path: location.path,
                exists_flag: location.exists ? 1 : 0,
                enabled: location.enabled ? 1 : 0,
                source: location.source,
                created_at: location.created_at,
                updated_at: location.updated_at,
            });
    }

    updateLocation(location: ApplicationLocationRecord): void {
        this.database
            .prepare(
                `
                    UPDATE application_locations
                    SET target_id   = @target_id,
                        name        = @name,
                        kind        = @kind,
                        scope       = @scope,
                        path        = @path,
                        exists_flag = @exists_flag,
                        enabled     = @enabled,
                        source      = @source,
                        updated_at  = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id: location.id,
                target_id: location.target_id,
                name: location.name,
                kind: location.kind,
                scope: location.scope,
                path: location.path,
                exists_flag: location.exists ? 1 : 0,
                enabled: location.enabled ? 1 : 0,
                source: location.source,
                updated_at: location.updated_at,
            });
    }
}

class SqliteSnapshotRepository implements SnapshotRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
    }

    listByAssetId(assetId: string): SnapshotRecord[] {
        return this.database
            .prepare(
                `
                    SELECT id,
                           asset_id,
                           snapshot_path,
                           message,
                           created_at
                    FROM snapshots
                    WHERE asset_id = ?
                    ORDER BY created_at DESC
                `
            )
            .all(assetId) as SnapshotRecord[];
    }

    findById(id: string): SnapshotRecord | null {
        return (
            (this.database
                .prepare(
                    `
                        SELECT id,
                               asset_id,
                               snapshot_path,
                               message,
                               created_at
                        FROM snapshots
                        WHERE id = ?
                    `
                )
                .get(id) as SnapshotRecord | undefined) ?? null
        );
    }

    create(snapshot: SnapshotRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO snapshots (id,
                                           asset_id,
                                           snapshot_path,
                                           message,
                                           created_at)
                    VALUES (@id,
                            @asset_id,
                            @snapshot_path,
                            @message,
                            @created_at)
                `
            )
            .run(snapshot);
    }
}

class SqliteTargetRepository implements TargetRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
    }

    list(): TargetRecord[] {
        const rows = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           path,
                           enabled,
                           deploy_mode,
                           created_at,
                           updated_at
                    FROM targets
                    ORDER BY updated_at DESC
                `
            )
            .all() as Array<{
            id: string;
            name: string;
            path: string;
            enabled: number;
            deploy_mode: TargetRecord["deployMode"];
            created_at: string;
            updated_at: string;
        }>;

        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            path: row.path,
            enabled: row.enabled === 1,
            deployMode: row.deploy_mode,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    }

    findById(id: string): TargetRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           path,
                           enabled,
                           deploy_mode,
                           created_at,
                           updated_at
                    FROM targets
                    WHERE id = ?
                `
            )
            .get(id) as
            | {
                  id: string;
                  name: string;
                  path: string;
                  enabled: number;
                  deploy_mode: TargetRecord["deployMode"];
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            name: row.name,
            path: row.path,
            enabled: row.enabled === 1,
            deployMode: row.deploy_mode,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    create(target: TargetRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO targets (id,
                                         name,
                                         path,
                                         enabled,
                                         deploy_mode,
                                         created_at,
                                         updated_at)
                    VALUES (@id,
                            @name,
                            @path,
                            @enabled,
                            @deploy_mode,
                            @created_at,
                            @updated_at)
                `
            )
            .run({
                id: target.id,
                name: target.name,
                path: target.path,
                enabled: target.enabled ? 1 : 0,
                deploy_mode: target.deployMode,
                created_at: target.created_at,
                updated_at: target.updated_at,
            });
    }

    update(target: TargetRecord): void {
        this.database
            .prepare(
                `
                    UPDATE targets
                    SET name        = @name,
                        path        = @path,
                        enabled     = @enabled,
                        deploy_mode = @deploy_mode,
                        updated_at  = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id: target.id,
                name: target.name,
                path: target.path,
                enabled: target.enabled ? 1 : 0,
                deploy_mode: target.deployMode,
                updated_at: target.updated_at,
            });
    }

    delete(id: string): void {
        this.database
            .prepare(
                `
                    DELETE
                    FROM targets
                    WHERE id = ?
                `
            )
            .run(id);
    }
}

export function createAssetRepository(): AssetRepository {
    return new SqliteAssetRepository(getDatabase());
}

export function createApplicationRepository(): ApplicationRepository {
    return new SqliteApplicationRepository(getDatabase());
}

export function createSnapshotRepository(): SnapshotRepository {
    return new SqliteSnapshotRepository(getDatabase());
}

export function createTargetRepository(): TargetRepository {
    return new SqliteTargetRepository(getDatabase());
}

class SqliteRuleRepository implements RuleRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
    }

    list(): RuleRecord[] {
        const rows = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           title,
                           description,
                           severity,
                           enabled,
                           created_at,
                           updated_at
                    FROM rules
                    ORDER BY updated_at DESC
                `
            )
            .all() as Array<{
            id: string;
            name: string;
            title: string;
            description: string;
            severity: RuleRecord["severity"];
            enabled: number;
            created_at: string;
            updated_at: string;
        }>;

        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            title: row.title,
            description: row.description ?? "",
            severity: row.severity,
            enabled: row.enabled === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    }

    findById(id: string): RuleRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           title,
                           description,
                           severity,
                           enabled,
                           created_at,
                           updated_at
                    FROM rules
                    WHERE id = ?
                `
            )
            .get(id) as
            | {
                  id: string;
                  name: string;
                  title: string;
                  description: string;
                  severity: RuleRecord["severity"];
                  enabled: number;
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            title: row.title,
            description: row.description ?? "",
            severity: row.severity,
            enabled: row.enabled === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    findByName(name: string): RuleRecord | null {
        const row = this.database
            .prepare(`SELECT id, name, title, description, severity, enabled, created_at, updated_at FROM rules WHERE name = ?`)
            .get(name) as
            | {
                  id: string;
                  name: string;
                  title: string;
                  description: string;
                  severity: RuleRecord["severity"];
                  enabled: number;
                  created_at: string;
                  updated_at: string;
              }
            | undefined;

        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            title: row.title,
            description: row.description ?? "",
            severity: row.severity,
            enabled: row.enabled === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    create(rule: RuleRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO rules (id,
                                       name,
                                       title,
                                       description,
                                       severity,
                                       enabled,
                                       created_at,
                                       updated_at)
                    VALUES (@id,
                            @name,
                            @title,
                            @description,
                            @severity,
                            @enabled,
                            @created_at,
                            @updated_at)
                `
            )
            .run({
                id: rule.id,
                name: rule.name,
                title: rule.title,
                description: rule.description,
                severity: rule.severity,
                enabled: rule.enabled ? 1 : 0,
                created_at: rule.created_at,
                updated_at: rule.updated_at,
            });
    }

    update(rule: RuleRecord): void {
        this.database
            .prepare(
                `
                    UPDATE rules
                    SET name        = @name,
                        title       = @title,
                        description = @description,
                        severity    = @severity,
                        enabled     = @enabled,
                        updated_at  = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id: rule.id,
                name: rule.name,
                title: rule.title,
                description: rule.description,
                severity: rule.severity,
                enabled: rule.enabled ? 1 : 0,
                updated_at: rule.updated_at,
            });
    }

    delete(id: string): void {
        this.database.prepare(`DELETE FROM rules WHERE id = ?`).run(id);
    }
}

class SqliteScenarioRepository implements ScenarioRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
    }

    private rowToRecord(row: any): ScenarioRecord {
        return {
            id: row.id,
            name: row.name,
            title: row.title,
            description: row.description ?? "",
            skillIds: JSON.parse(row.skill_ids ?? "[]"),
            ruleIds: JSON.parse(row.rule_ids ?? "[]"),
            agentFileIds: JSON.parse(row.agent_file_ids ?? "[]"),
            agentAppIds: JSON.parse(row.agent_app_ids ?? "[]"),
            projectIds: JSON.parse(row.project_ids ?? "[]"),
            isBuiltIn: row.is_built_in === 1,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    list(): ScenarioRecord[] {
        const rows = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           title,
                           description,
                           skill_ids,
                           rule_ids,
                           agent_file_ids,
                           agent_app_ids,
                           project_ids,
                           is_built_in,
                           created_at,
                           updated_at
                    FROM scenarios
                    ORDER BY is_built_in DESC, updated_at DESC
                `
            )
            .all() as any[];

        return rows.map((row) => this.rowToRecord(row));
    }

    findById(id: string): ScenarioRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           title,
                           description,
                           skill_ids,
                           rule_ids,
                           agent_file_ids,
                           agent_app_ids,
                           project_ids,
                           is_built_in,
                           created_at,
                           updated_at
                    FROM scenarios
                    WHERE id = ?
                `
            )
            .get(id) as any;

        return row ? this.rowToRecord(row) : null;
    }

    findByName(name: string): ScenarioRecord | null {
        const row = this.database
            .prepare(
                `
                    SELECT id,
                           name,
                           title,
                           description,
                           skill_ids,
                           rule_ids,
                           agent_file_ids,
                           agent_app_ids,
                           project_ids,
                           is_built_in,
                           created_at,
                           updated_at
                    FROM scenarios
                    WHERE name = ?
                `
            )
            .get(name) as any;

        return row ? this.rowToRecord(row) : null;
    }

    count(): number {
        const row = this.database
            .prepare(`SELECT COUNT(*) as c FROM scenarios`)
            .get() as {c: number};

        return row.c;
    }

    create(scenario: ScenarioRecord): void {
        this.database
            .prepare(
                `
                    INSERT INTO scenarios (id,
                                           name,
                                           title,
                                           description,
                                           skill_ids,
                                           rule_ids,
                                           agent_file_ids,
                                           agent_app_ids,
                                           project_ids,
                                           is_built_in,
                                           created_at,
                                           updated_at)
                    VALUES (@id,
                            @name,
                            @title,
                            @description,
                            @skill_ids,
                            @rule_ids,
                            @agent_file_ids,
                            @agent_app_ids,
                            @project_ids,
                            @is_built_in,
                            @created_at,
                            @updated_at)
                `
            )
            .run({
                id: scenario.id,
                name: scenario.name,
                title: scenario.title,
                description: scenario.description,
                skill_ids: JSON.stringify(scenario.skillIds),
                rule_ids: JSON.stringify(scenario.ruleIds),
                agent_file_ids: JSON.stringify(scenario.agentFileIds),
                agent_app_ids: JSON.stringify(scenario.agentAppIds),
                project_ids: JSON.stringify(scenario.projectIds),
                is_built_in: scenario.isBuiltIn ? 1 : 0,
                created_at: scenario.created_at,
                updated_at: scenario.updated_at,
            });
    }

    update(scenario: ScenarioRecord): void {
        this.database
            .prepare(
                `
                    UPDATE scenarios
                    SET name           = @name,
                        title          = @title,
                        description    = @description,
                        skill_ids      = @skill_ids,
                        rule_ids       = @rule_ids,
                        agent_file_ids = @agent_file_ids,
                        agent_app_ids  = @agent_app_ids,
                        project_ids    = @project_ids,
                        updated_at     = @updated_at
                    WHERE id = @id
                `
            )
            .run({
                id: scenario.id,
                name: scenario.name,
                title: scenario.title,
                description: scenario.description,
                skill_ids: JSON.stringify(scenario.skillIds),
                rule_ids: JSON.stringify(scenario.ruleIds),
                agent_file_ids: JSON.stringify(scenario.agentFileIds),
                agent_app_ids: JSON.stringify(scenario.agentAppIds),
                project_ids: JSON.stringify(scenario.projectIds),
                updated_at: scenario.updated_at,
            });
    }

    delete(id: string): void {
        this.database
            .prepare(`DELETE FROM scenarios WHERE id = ?`)
            .run(id);
    }

    addAssetId(
        id: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): void {
        const columnMap: Record<typeof field, string> = {
            skillIds: "skill_ids",
            ruleIds: "rule_ids",
            agentFileIds: "agent_file_ids",
        };
        const column = columnMap[field];

        const current = this.findById(id);
        if (!current) return;
        if (current[field].includes(assetId)) return;

        const next = [...current[field], assetId];
        this.database
            .prepare(`UPDATE scenarios SET ${column} = ? WHERE id = ?`)
            .run(JSON.stringify(next), id);
    }

    removeAssetId(
        id: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): void {
        const columnMap: Record<typeof field, string> = {
            skillIds: "skill_ids",
            ruleIds: "rule_ids",
            agentFileIds: "agent_file_ids",
        };
        const column = columnMap[field];

        const current = this.findById(id);
        if (!current) return;
        const next = current[field].filter((aid) => aid !== assetId);
        this.database
            .prepare(`UPDATE scenarios SET ${column} = ? WHERE id = ?`)
            .run(JSON.stringify(next), id);
    }
}

export function createScenarioRepository(): ScenarioRepository {
    return new SqliteScenarioRepository(getDatabase());
}

export function createRuleRepository(): RuleRepository {
    return new SqliteRuleRepository(getDatabase());
}
