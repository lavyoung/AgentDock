type RemoveManagedBlockInput = {
    originalContent: string;
    assetId: string;
};

export type RemoveManagedBlockResult =
    | {status: "updated" | "noop"; content: string}
    | {status: "conflict"; reason: string; content: string};

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function removeManagedBlock(
    input: RemoveManagedBlockInput
): RemoveManagedBlockResult {
    const blockRegex = new RegExp(
        `(?:\\n{0,2})<!--\\s*agentdock:start\\s+${escapeRegExp(input.assetId)}@[^\\s]+\\s*-->[\\s\\S]*?<!--\\s*agentdock:end\\s+${escapeRegExp(input.assetId)}\\s*-->\\n?`,
        "g"
    );
    const startRegex = new RegExp(
        `<!--\\s*agentdock:start\\s+${escapeRegExp(input.assetId)}@[^\\s]+\\s*-->`,
        "g"
    );
    const endRegex = new RegExp(
        `<!--\\s*agentdock:end\\s+${escapeRegExp(input.assetId)}\\s*-->`,
        "g"
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

    if (startMatches.length === 0) {
        return {
            status: "noop",
            content: input.originalContent,
        };
    }

    const nextContent = input.originalContent
        .replace(blockRegex, "")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd();

    return {
        status: "updated",
        content: nextContent.length > 0 ? `${nextContent}\n` : "",
    };
}
