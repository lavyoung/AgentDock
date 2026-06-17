import {beforeEach, describe, expect, it} from "vitest";

import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {AssetRecord} from "../types/asset";
import {
    readAssetContent,
    removeAgentsMdBlock,
    removeSkillOutput,
    writeAgentsMdMerge,
    writeAgentsMdMerges,
    writeSkillOutput,
} from "./syncExecutorHelpers";

import path from "node:path";

/**
 * In-memory `FileSystemPort` for the executor tests. Mirrors the contract
 * but keeps state in a map so each test can reset it.
 */
class InMemoryFileSystem implements FileSystemPort {
    files = new Map<string, string>();
    dirs = new Set<string>();
    removed: string[] = [];

    constructor(seed: Record<string, string> = {}) {
        for (const [key, value] of Object.entries(seed)) {
            this.files.set(this.normalize(key), value);
            this.dirs.add(this.dirname(this.normalize(key)));
        }
    }

    async exists(p: string): Promise<boolean> {
        const key = this.normalize(p);
        return this.files.has(key) || this.dirs.has(key);
    }

    async readText(p: string): Promise<string> {
        const key = this.normalize(p);
        const value = this.files.get(key);
        if (value === undefined) {
            throw new Error(`ENOENT: ${p}`);
        }
        return value;
    }

    async writeText(p: string, content: string): Promise<void> {
        const key = this.normalize(p);
        this.files.set(key, content);
        this.dirs.add(this.dirname(key));
    }

    async ensureDir(p: string): Promise<void> {
        this.dirs.add(this.normalize(p));
    }

    async copyDir(): Promise<void> {
        throw new Error("copyDir not used in these tests");
    }

    async emptyDir(p: string): Promise<void> {
        const prefix = this.normalize(p);
        for (const key of [...this.files.keys()]) {
            if (key.startsWith(prefix)) {
                this.files.delete(key);
            }
        }
        this.dirs.delete(prefix);
    }

    async remove(p: string): Promise<void> {
        const key = this.normalize(p);
        this.removed.push(key);
        // Best-effort: remove matching files and the directory.
        for (const fileKey of [...this.files.keys()]) {
            if (fileKey.startsWith(key)) {
                this.files.delete(fileKey);
            }
        }
        this.dirs.delete(key);
    }

    private normalize(p: string): string {
        return p.replace(/\\/g, "/").replace(/\/+$/g, "");
    }

    private dirname(p: string): string {
        const idx = p.lastIndexOf("/");
        return idx === -1 ? "" : p.slice(0, idx);
    }
}

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

const startMarker = (asset: AssetRecord): string =>
    `<!-- agentdock:start ${asset.id}@${asset.version} -->`;
const endMarker = (asset: AssetRecord): string =>
    `<!-- agentdock:end ${asset.id} -->`;

describe("executor: readAssetContent", () => {
    it("reads from <asset.path>/current/<mainFile>", async () => {
        const asset = makeAsset({path: "/registry/asset-1", type: "skill"});
        const fs = new InMemoryFileSystem({
            "/registry/asset-1/current/SKILL.md": "hello skill",
        });

        const content = await readAssetContent(fs, testPath, asset);

        expect(content).toBe("hello skill");
    });
});

describe("executor: writeSkillOutput", () => {
    it("writes the canonical skill bundle and ensures the per-asset dir", async () => {
        const asset = makeAsset({id: "review", name: "Display Name", path: "/registry/review"});
        const fs = new InMemoryFileSystem({
            "/registry/review/current/SKILL.md": "## Review skill",
        });

        await writeSkillOutput(fs, testPath, "/targets/proj", asset);

        expect(fs.files.get("/targets/proj/skills/review/SKILL.md")).toBe("## Review skill");
        expect(fs.dirs.has("/targets/proj/skills/review")).toBe(true);
    });

    it("uses asset.id, not asset.name, as the directory name", async () => {
        const asset = makeAsset({id: "stable-id", name: "unstable name", path: "/registry/stable-id"});
        const fs = new InMemoryFileSystem({
            "/registry/stable-id/current/SKILL.md": "x",
        });

        await writeSkillOutput(fs, testPath, "/t", asset);

        expect(fs.files.has("/t/skills/stable-id/SKILL.md")).toBe(true);
        expect(fs.files.has("/t/skills/unstable name/SKILL.md")).toBe(false);
    });
});

describe("executor: writeAgentsMdMerge", () => {
    let fs: InMemoryFileSystem;
    let asset: AssetRecord;

    beforeEach(() => {
        asset = makeAsset({id: "agents-1", type: "agents-md"});
        fs = new InMemoryFileSystem({
            "/registry/asset-1/current/AGENTS.md": "## Generated AGENTS body",
        });
    });

    it("creates a new AGENTS.md with a managed block when the file is absent", async () => {
        const result = await writeAgentsMdMerge(fs, testPath, "/proj/AGENTS.md", asset);

        expect(result.status).toBe("ok");
        expect(fs.dirs.has("/proj")).toBe(true);
        const written = fs.files.get("/proj/AGENTS.md");
        expect(written).toBeDefined();
        expect(written).toContain(startMarker(asset));
        expect(written).toContain("## Generated AGENTS body");
        expect(written).toContain(endMarker(asset));
    });

    it("appends to existing user content without overwriting it", async () => {
        fs.files.set("/proj/AGENTS.md", "User intro\n\nUser rules\n");

        const result = await writeAgentsMdMerge(fs, testPath, "/proj/AGENTS.md", asset);

        expect(result.status).toBe("ok");
        const written = fs.files.get("/proj/AGENTS.md");
        expect(written).toContain("User intro");
        expect(written).toContain("User rules");
        expect(written).toContain(startMarker(asset));
    });

    it("updates an existing managed block in place", async () => {
        const existing = [
            "User intro",
            "",
            startMarker(asset),
            "old body",
            endMarker(asset),
        ].join("\n");
        fs.files.set("/proj/AGENTS.md", existing);

        const result = await writeAgentsMdMerge(fs, testPath, "/proj/AGENTS.md", asset);

        expect(result.status).toBe("ok");
        const written = fs.files.get("/proj/AGENTS.md");
        expect(written).toContain("User intro");
        expect(written).toContain("## Generated AGENTS body");
        expect(written).not.toContain("old body");
    });

    it("returns conflict and leaves the file untouched when markers are inconsistent", async () => {
        const malformed = [
            startMarker(asset),
            "no matching end",
        ].join("\n");
        fs.files.set("/proj/AGENTS.md", malformed);

        const result = await writeAgentsMdMerge(fs, testPath, "/proj/AGENTS.md", asset);

        expect(result.status).toBe("conflict");
        if (result.status !== "conflict") {
            return;
        }

        expect(result.reason).toContain("inconsistent");
        expect(fs.files.get("/proj/AGENTS.md")).toBe(malformed);
    });
});

describe("executor: writeAgentsMdMerges (multi-asset chain)", () => {
    it("stacks multiple AGENTS.md assets into one file via successive managed blocks", async () => {
        const fs = new InMemoryFileSystem();
        const a = makeAsset({id: "a1", type: "agents-md", path: "/reg/a1"});
        const b = makeAsset({id: "a2", type: "agents-md", path: "/reg/a2"});
        fs.files.set("/reg/a1/current/AGENTS.md", "## a1 body");
        fs.files.set("/reg/a2/current/AGENTS.md", "## a2 body");

        const result = await writeAgentsMdMerges(fs, testPath, "/proj/AGENTS.md", [a, b]);

        expect(result.status).toBe("ok");
        expect(fs.dirs.has("/proj")).toBe(true);
        const written = fs.files.get("/proj/AGENTS.md");
        expect(written).toContain("## a1 body");
        expect(written).toContain("## a2 body");
    });

    it("returns conflict with the offending assetId and does not write the file", async () => {
        // Pre-seed the target file with a dangling a1 start marker. The
        // chain reads a1 first, sees an inconsistent block for assetId="a1"
        // in the existing file, and aborts.
        const dangling = [
            "User header",
            "",
            "<!-- agentdock:start a1@0.1.0 -->",
            "no matching end",
        ].join("\n");

        const fs = new InMemoryFileSystem({
            "/proj/AGENTS.md": dangling,
            "/reg/a1/current/AGENTS.md": "## a1 body",
            "/reg/a2/current/AGENTS.md": "## a2 body",
        });
        const a = makeAsset({id: "a1", type: "agents-md", path: "/reg/a1"});
        const b = makeAsset({id: "a2", type: "agents-md", path: "/reg/a2"});

        const result = await writeAgentsMdMerges(fs, testPath, "/proj/AGENTS.md", [a, b]);

        expect(result.status).toBe("conflict");
        if (result.status !== "conflict") {
            return;
        }

        expect(result.assetId).toBe("a1");
        // File must not have been rewritten.
        expect(fs.files.get("/proj/AGENTS.md")).toBe(dangling);
    });
});

describe("executor: removeSkillOutput", () => {
    it("removes the per-asset directory containing the SKILL.md file", async () => {
        const fs = new InMemoryFileSystem({
            "/t/skills/asset-1/SKILL.md": "x",
        });

        await removeSkillOutput(fs, testPath, "/t/skills/asset-1/SKILL.md");

        expect(fs.removed).toContain("/t/skills/asset-1");
        expect(fs.files.has("/t/skills/asset-1/SKILL.md")).toBe(false);
    });
});

describe("executor: removeAgentsMdBlock", () => {
    const buildAsset = () => makeAsset({id: "agents-1", type: "agents-md"});

    it("returns ok when the AGENTS.md file does not exist", async () => {
        const fs = new InMemoryFileSystem();
        const result = await removeAgentsMdBlock(fs, "/missing/AGENTS.md", buildAsset().id);

        expect(result.status).toBe("ok");
    });

    it("removes only this asset's block", async () => {
        const asset = buildAsset();
        const original = [
            "User intro",
            "",
            `<!-- agentdock:start ${asset.id}@${asset.version} -->`,
            "old body",
            `<!-- agentdock:end ${asset.id} -->`,
            "",
            "User footer",
        ].join("\n");

        const fs = new InMemoryFileSystem({"/proj/AGENTS.md": original});

        const result = await removeAgentsMdBlock(fs, "/proj/AGENTS.md", asset.id);

        expect(result.status).toBe("ok");
        const written = fs.files.get("/proj/AGENTS.md");
        expect(written).toContain("User intro");
        expect(written).toContain("User footer");
        expect(written).not.toContain("old body");
        expect(written).not.toContain(startMarker(asset));
    });

    it("returns conflict and leaves the file untouched when markers are inconsistent", async () => {
        const asset = buildAsset();
        const malformed = [
            startMarker(asset),
            "no matching end",
        ].join("\n");

        const fs = new InMemoryFileSystem({"/proj/AGENTS.md": malformed});

        const result = await removeAgentsMdBlock(fs, "/proj/AGENTS.md", asset.id);

        expect(result.status).toBe("conflict");
        expect(fs.files.get("/proj/AGENTS.md")).toBe(malformed);
    });
});
