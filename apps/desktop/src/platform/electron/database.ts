import Database from "better-sqlite3";

import type {AssetRepository} from "../../core/asset/assetRepository";
import type {SnapshotRepository} from "../../core/snapshot/snapshotRepository";
import type {AssetRecord} from "../../core/types/asset";
import type {SnapshotRecord} from "../../core/types/snapshot";
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
    `);
}

class SqliteAssetRepository implements AssetRepository {
    private readonly database: Database.Database;

    constructor(database: Database.Database) {
        this.database = database;
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
        changes: Pick<AssetRecord, "title" | "description" | "updated_at">
    ): void {
        this.database
            .prepare(
                `
                    UPDATE assets
                    SET title       = @title,
                        description = @description,
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

export function createAssetRepository(): AssetRepository {
    return new SqliteAssetRepository(getDatabase());
}

export function createSnapshotRepository(): SnapshotRepository {
    return new SqliteSnapshotRepository(getDatabase());
}
