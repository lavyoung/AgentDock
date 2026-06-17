import {describe, expect, it} from "vitest";

import {removeManagedBlock} from "./removeManagedBlock";

const ASSET_ID = "frontend-review";
const VERSION = "0.3.1";

const startMarker = `<!-- agentdock:start ${ASSET_ID}@${VERSION} -->`;
const endMarker = `<!-- agentdock:end ${ASSET_ID} -->`;

const buildBlock = (body: string): string =>
    `${startMarker}\n${body}\n${endMarker}`;

describe("removeManagedBlock", () => {
    it("removes the managed block and preserves surrounding user content", () => {
        const header = "user header\n\n";
        const footer = "\n\nuser footer";
        const originalContent = `${header}${buildBlock("block body")}${footer}`;

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        expect(result.content).toContain("user header");
        expect(result.content).toContain("user footer");
        expect(result.content).not.toContain(startMarker);
        expect(result.content).not.toContain(endMarker);
        expect(result.content).not.toContain("block body");
    });

    it("returns noop when there is no managed block for this asset", () => {
        const otherStart = `<!-- agentdock:start other@1.0.0 -->`;
        const otherEnd = `<!-- agentdock:end other -->`;
        const originalContent = `${otherStart}\nother body\n${otherEnd}`;

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("noop");
        if (result.status !== "noop") {
            return;
        }

        expect(result.content).toBe(originalContent);
    });

    it("returns noop when the file is empty", () => {
        const result = removeManagedBlock({
            originalContent: "",
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("noop");
    });

    it("removes only this asset's block when multiple assets share the file", () => {
        const otherStart = `<!-- agentdock:start other@1.0.0 -->`;
        const otherEnd = `<!-- agentdock:end other -->`;
        const originalContent = [
            otherStart,
            "other body",
            otherEnd,
            "",
            buildBlock("target body"),
        ].join("\n");

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        expect(result.content).toContain(otherStart);
        expect(result.content).toContain(otherEnd);
        expect(result.content).toContain("other body");
        expect(result.content).not.toContain(startMarker);
        expect(result.content).not.toContain("target body");
    });

    it("returns conflict when start and end marker counts disagree", () => {
        const originalContent = [
            startMarker,
            "orphan body without matching end",
        ].join("\n");

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("conflict");
        if (result.status !== "conflict") {
            return;
        }

        expect(result.reason).toContain("inconsistent");
        // Conflict must leave the file untouched so the user can recover it.
        expect(result.content).toBe(originalContent);
    });

    it("returns conflict when the same asset has duplicated blocks", () => {
        const originalContent = [
            buildBlock("first"),
            "",
            buildBlock("second"),
        ].join("\n");

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("conflict");
    });

    it("normalizes excessive blank lines after removal", () => {
        const originalContent = [
            "user header",
            "",
            "",
            "",
            buildBlock("body"),
            "",
            "",
            "",
            "user footer",
        ].join("\n");

        const result = removeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        // After removal and normalization we expect at most one blank line
        // between header and footer, and exactly one trailing newline.
        expect(result.content).not.toMatch(/\n{3,}/);
        expect(result.content).toContain("user header");
        expect(result.content).toContain("user footer");
    });
});
