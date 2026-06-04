type MergeManagedBlockInput = {
    originalContent: string;
    assetId: string;
    version: string;
    generatedContent: string;
};

export type MergeManagedBlockResult =
    | {status: "updated" | "appended"; content: string}
    | {status: "conflict"; reason: string; content: string};

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function mergeManagedBlock(
    input: MergeManagedBlockInput
): MergeManagedBlockResult {
    const startPattern = `<!-- agentdock:start ${input.assetId}@${input.version} -->`;
    const endPattern = `<!-- agentdock:end ${input.assetId} -->`;
    const nextBlock = `${startPattern}\n${input.generatedContent}\n${endPattern}`;
    const startRegex = new RegExp(
        `<!--\\s*agentdock:start\\s+${escapeRegExp(input.assetId)}@[^\\s]+\\s*-->`,
        "g"
    );
    const endRegex = new RegExp(
        `<!--\\s*agentdock:end\\s+${escapeRegExp(input.assetId)}\\s*-->`,
        "g"
    );
    const blockRegex = new RegExp(
        `<!--\\s*agentdock:start\\s+${escapeRegExp(input.assetId)}@[^\\s]+\\s*-->[\\s\\S]*?<!--\\s*agentdock:end\\s+${escapeRegExp(input.assetId)}\\s*-->`
    );

    const startMatches = [...input.originalContent.matchAll(startRegex)];
    const endMatches = [...input.originalContent.matchAll(endRegex)];

    if (startMatches.length !== endMatches.length || startMatches.length > 1) {
        return {
            status: "conflict",
            reason: "Managed block markers are inconsistent for this asset.",
            content: input.originalContent,
        };
    }

    if (startMatches.length === 1 && endMatches.length === 1) {
        return {
            status: "updated",
            content: input.originalContent.replace(blockRegex, nextBlock),
        };
    }

    const trimmedOriginal = input.originalContent.trimEnd();
    const separator = trimmedOriginal.length > 0 ? "\n\n" : "";

    return {
        status: "appended",
        content: `${trimmedOriginal}${separator}${nextBlock}\n`,
    };
}
