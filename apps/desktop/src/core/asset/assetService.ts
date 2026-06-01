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

export type AssetRecord = {
    id: string;
    type: AssetType;
    name: string;
    title: string;
    description: string;
    version: string;
    status: string;
    path: string;
    created_at: string;
    updated_at: string;
};

export type AssetDetail = AssetRecord & {
    content: string;
};

export type UpdateAssetInput = {
    title?: string;
    description?: string;
    content?: string;
};

function getMainFileName(type: AssetType) {
    return type === "skill" ? "SKILL.md" : "AGENTS.md";
}

export async function getAsset(id: string): Promise<AssetDetail | null> {
    const db = getDb();

    const asset = db
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
        .get(id) as AssetRecord | undefined;

    if (!asset) {
        return null;
    }

    const mainFileName = getMainFileName(asset.type);
    const contentPath = path.join(asset.path, "current", mainFileName);

    const content = await fs.readFile(contentPath, "utf-8");

    return {
        ...asset,
        content,
    };
}

export async function updateAsset(id: string, input: UpdateAssetInput) {
    const db = getDb();

    const asset = db
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
        .get(id) as AssetRecord | undefined;

    if (!asset) {
        throw new Error(`Asset not found: ${id}`);
    }

    const now = new Date().toISOString();

    const nextTitle = input.title ?? asset.title;
    const nextDescription = input.description ?? asset.description;
    const nextContent = input.content;

    const currentDir = path.join(asset.path, "current");
    const mainFileName = getMainFileName(asset.type);

    const metadata = {
        id: asset.id,
        type: asset.type,
        name: asset.name,
        title: nextTitle,
        description: nextDescription,
        version: asset.version,
        status: asset.status,
    };

    await fs.writeFile(
        path.join(currentDir, "asset.yaml"),
        yaml.stringify(metadata),
        "utf-8"
    );

    if (typeof nextContent === "string") {
        await fs.writeFile(
            path.join(currentDir, mainFileName),
            nextContent,
            "utf-8"
        );
    }

    db.prepare(
        `
            UPDATE assets
            SET title       = @title,
                description = @description,
                updated_at  = @updated_at
            WHERE id = @id
        `
    ).run({
        id,
        title: nextTitle,
        description: nextDescription,
        updated_at: now,
    });

    return getAsset(id);
}