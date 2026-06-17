import {describe, expect, it} from "vitest";

import {mergeManagedBlock} from "./mergeManagedBlock";

const ASSET_ID = "frontend-review";
const VERSION = "0.3.1";

const startMarker = `<!-- agentdock:start ${ASSET_ID}@${VERSION} -->`;
const endMarker = `<!-- agentdock:end ${ASSET_ID} -->`;

const buildBlock = (body: string): string =>
    `${startMarker}\n${body}\n${endMarker}`;

describe("mergeManagedBlock", () => {
    it("appends a new block when the file is empty", () => {
        const result = mergeManagedBlock({
            originalContent: "",
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "first body",
        });

        expect(result.status).toBe("appended");
        if (result.status !== "appended") {
            return;
        }

        expect(result.content).toContain(startMarker);
        expect(result.content).toContain(endMarker);
        expect(result.content).toContain("first body");
        expect(result.content.endsWith("\n")).toBe(true);
    });

    it("appends a new block after existing user content", () => {
        const result = mergeManagedBlock({
            originalContent: "user notes\n\nmore notes",
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "block body",
        });

        expect(result.status).toBe("appended");
        if (result.status !== "appended") {
            return;
        }

        expect(result.content.startsWith("user notes\n\nmore notes\n\n")).toBe(true);
        expect(result.content).toContain(startMarker);
        expect(result.content).toContain("block body");
        expect(result.content).toContain(endMarker);
    });

    it("updates an existing block in place without disturbing surrounding user content", () => {
        const userHeader = "My custom rules\n=================\n";
        const userFooter = "\n\nFooter line that I wrote myself.";
        const originalContent = `${userHeader}${buildBlock("old body")}${userFooter}`;

        const result = mergeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "fresh body",
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        expect(result.content).toContain(userHeader);
        expect(result.content).toContain(userFooter);
        expect(result.content).toContain(startMarker);
        expect(result.content).toContain("fresh body");
        expect(result.content).not.toContain("old body");
    });

    it("preserves a different asset's block when updating this asset's block", () => {
        const otherStart = `<!-- agentdock:start other-asset@1.0.0 -->`;
        const otherEnd = `<!-- agentdock:end other-asset -->`;
        const otherBlock = `${otherStart}\nother body\n${otherEnd}`;
        const originalContent = `${otherBlock}\n\n${buildBlock("old body")}`;

        const result = mergeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "fresh body",
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        expect(result.content).toContain(otherStart);
        expect(result.content).toContain(otherEnd);
        expect(result.content).toContain("other body");
        expect(result.content).toContain("fresh body");
        expect(result.content).not.toContain("old body");
    });

    it("returns conflict when start marker is duplicated", () => {
        const originalContent = [
            buildBlock("first body"),
            "",
            buildBlock("second body"),
        ].join("\n");

        const result = mergeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "fresh body",
        });

        expect(result.status).toBe("conflict");
        if (result.status !== "conflict") {
            return;
        }

        expect(result.reason).toContain("inconsistent");
        // The function must leave the original content untouched on conflict.
        expect(result.content).toBe(originalContent);
    });

    it("returns conflict when start and end marker counts disagree", () => {
        const originalContent = [
            `<!-- agentdock:start ${ASSET_ID}@${VERSION} -->`,
            "stray body without matching end",
        ].join("\n");

        const result = mergeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "fresh body",
        });

        expect(result.status).toBe("conflict");
    });

    it("treats the markers as version-agnostic on lookup but writes the requested version on update", () => {
        const oldStart = `<!-- agentdock:start ${ASSET_ID}@0.0.1 -->`;
        const oldEnd = `<!-- agentdock:end ${ASSET_ID} -->`;
        const originalContent = `${oldStart}\nold body\n${oldEnd}`;

        const result = mergeManagedBlock({
            originalContent,
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "fresh body",
        });

        expect(result.status).toBe("updated");
        if (result.status !== "updated") {
            return;
        }

        expect(result.content).toContain(startMarker);
        expect(result.content).toContain("fresh body");
        expect(result.content).not.toContain("0.0.1");
    });

    it("appends with a single leading newline even when the file ends with a single trailing newline", () => {
        const result = mergeManagedBlock({
            originalContent: "user notes\n",
            assetId: ASSET_ID,
            version: VERSION,
            generatedContent: "block body",
        });

        expect(result.status).toBe("appended");
        if (result.status !== "appended") {
            return;
        }

        // Two blank lines worth of breathing room between user content
        // and the managed block, then the block, then exactly one trailing
        // newline.
        expect(result.content).toMatch(/\n\n<!-- agentdock:start /);
        expect(result.content.endsWith("\n")).toBe(true);
    });
});
