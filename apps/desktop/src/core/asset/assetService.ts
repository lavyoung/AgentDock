import path from "node:path";
import crypto from "node:crypto";
import fs from "fs-extra";
import yaml from "yaml";

import {getDb} from "../db/database";
import {getAgentDockDataDir} from "../storage/paths";

export type AssetType = "skill" | "agents-md";

export type CreateAssetInput = {
    type: AssetType;
    name: string;
    title?: string;
    description?: string;
    content: string;
};

export function listAssets() {
    const db = getDb();

    return db
        .prepare(
            `
                SELECT
                    id,
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
        .all();
}

export async function createAsset(input: CreateAssetInput) {
    const db = getDb();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const version = "0.1.0";
    const status = "active";

    const safeName = input.name.trim();
    const assetDir = path.join(
        getAgentDockDataDir(),
        "registry",
        "assets",
        safeName
    );

    const currentDir = path.join(assetDir, "current");

    await fs.ensureDir(currentDir);

    const metadata = {
        id,
        type: input.type,
        name: safeName,
        title: input.title || safeName,
        description: input.description || "",
        version,
        status,
    };

    await fs.writeFile(
        path.join(currentDir, "asset.yaml"),
        yaml.stringify(metadata),
        "utf-8"
    );

    const mainFileName = input.type === "skill" ? "SKILL.md" : "AGENTS.md";

    await fs.writeFile(
        path.join(currentDir, mainFileName),
        input.content,
        "utf-8"
    );

    db.prepare(
        `
            INSERT INTO assets (
                id,
                type,
                name,
                title,
                description,
                version,
                status,
                path,
                created_at,
                updated_at
            ) VALUES (
                         @id,
                         @type,
                         @name,
                         @title,
                         @description,
                         @version,
                         @status,
                         @path,
                         @created_at,
                         @updated_at
                     )
        `
    ).run({
        id,
        type: input.type,
        name: safeName,
        title: input.title || safeName,
        description: input.description || "",
        version,
        status,
        path: assetDir,
        created_at: now,
        updated_at: now,
    });

    return {
        ...metadata,
        path: assetDir,
        created_at: now,
        updated_at: now,
    };
}