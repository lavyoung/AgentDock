import path from "node:path";
import crypto from "node:crypto";
import fs from "fs-extra";

import {getDb} from "../db/database";

export type SnapshotRecord = {
    id: string;
    asset_id: string;
    snapshot_path: string;
    message: string;
    created_at: string;
};

function getSnapshotFolderName(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

export async function createSnapshot(assetId: string, assetPath: string, message: string) {
    const db = getDb();

    const id = crypto.randomUUID();
    const now = new Date();
    const createdAt = now.toISOString();

    const currentDir = path.join(assetPath, "current");
    const snapshotsDir = path.join(assetPath, "snapshots");
    const snapshotDir = path.join(snapshotsDir, getSnapshotFolderName(now));

    await fs.ensureDir(snapshotsDir);

    const currentExists = await fs.pathExists(currentDir);
    if (!currentExists) {
        throw new Error(`Current directory not found: ${currentDir}`);
    }

    await fs.copy(currentDir, snapshotDir, {
        overwrite: false,
        errorOnExist: true,
    });

    db.prepare(
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
    ).run({
        id,
        asset_id: assetId,
        snapshot_path: snapshotDir,
        message,
        created_at: createdAt,
    });

    return {
        id,
        asset_id: assetId,
        snapshot_path: snapshotDir,
        message,
        created_at: createdAt,
    };
}

export function listSnapshots(assetId: string) {
    const db = getDb();

    return db
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


export async function restoreSnapshot(snapshotId: string) {
    const db = getDb();

    const snapshot = db.prepare(
        `
            SELECT id,
                   asset_id,
                   snapshot_path,
                   message,
                   created_at
            FROM snapshots
            WHERE id = ? `
    ).get(snapshotId) as SnapshotRecord | undefined;

    if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    const asset = db
        .prepare(
            `
                SELECT id,
                       path
                FROM assets
                WHERE id = ?
            `
        )
        .get(snapshot.asset_id) as { id: string; path: string } | undefined;

    if (!asset) {
        throw new Error(`Asset not found: ${snapshot.asset_id}`);
    }
    const currentDir = path.join(asset.path, "current");

    const snapshotExists = await fs.pathExists(snapshot.snapshot_path);
    if (!snapshotExists) {
        throw new Error(`Snapshot path not found: ${snapshot.snapshot_path}`);
    }

    await fs.emptyDir(currentDir);
    await fs.copy(snapshot.snapshot_path, currentDir, {
        overwrite: true,
    });

    const now = new Date().toISOString();

    db.prepare(
        `
            UPDATE assets
            SET updated_at = @updated_at
            WHERE id = @id
        `
    ).run({
        id: asset.id,
        updated_at: now,
    });

    return {
        restored: true,
        asset_id: snapshot.asset_id,
        snapshot_id: snapshot.id,
    };
}