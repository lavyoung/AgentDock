import Database from "better-sqlite3";
import {getDbPath} from "../storage/paths";

let db: Database.Database | null = null;

export function getDb() {
    if (!db) {
        db = new Database(getDbPath());
        db.pragma("journal_mode = WAL");
    }

    return db;
}

export function migrate() {
    const database = getDb();

    database.exec(`
        CREATE TABLE IF NOT EXISTS assets
        (
            id
            TEXT
            PRIMARY
            KEY,
            type
            TEXT
            NOT
            NULL,
            name
            TEXT
            NOT
            NULL,
            title
            TEXT,
            description
            TEXT,
            version
            TEXT,
            status
            TEXT,
            path
            TEXT
            NOT
            NULL,
            created_at
            TEXT,
            updated_at
            TEXT
        );

        CREATE TABLE IF NOT EXISTS targets
        (
            id
            TEXT
            PRIMARY
            KEY,
            name
            TEXT
            NOT
            NULL,
            path
            TEXT
            NOT
            NULL,
            enabled
            INTEGER
            DEFAULT
            1,
            deploy_mode
            TEXT
            DEFAULT
            'copy',
            created_at
            TEXT,
            updated_at
            TEXT
        );

        CREATE TABLE IF NOT EXISTS asset_targets
        (
            asset_id
            TEXT
            NOT
            NULL,
            target_id
            TEXT
            NOT
            NULL,
            enabled
            INTEGER
            DEFAULT
            0,
            sync_status
            TEXT
            DEFAULT
            'off',
            last_synced_at
            TEXT,
            last_checksum
            TEXT,
            PRIMARY
            KEY
        (
            asset_id,
            target_id
        )
            );

        CREATE TABLE IF NOT EXISTS snapshots
        (
            id
            TEXT
            PRIMARY
            KEY,
            asset_id
            TEXT
            NOT
            NULL,
            snapshot_path
            TEXT
            NOT
            NULL,
            message
            TEXT,
            created_at
            TEXT
        );
    `);
}