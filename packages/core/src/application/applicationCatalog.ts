import type {ApplicationId, ApplicationLocationKind} from "../types/application";

export type ApplicationDefinition = {
    id: ApplicationId;
    name: string;
    description: string;
    globalSkillSegments: string[];
    projectSkillSegments: string[];
    projectSupports: ApplicationLocationKind[];
};

export const APPLICATION_CATALOG: Record<ApplicationId, ApplicationDefinition> = {
    codex: {
        id: "codex",
        name: "Codex",
        description: "OpenAI local coding agent with shared global skills and project-scoped AGENTS.md.",
        globalSkillSegments: [".codex", "skills"],
        projectSkillSegments: [".codex", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
    "claude-code": {
        id: "claude-code",
        name: "Claude Code",
        description: "Anthropic coding workflow with per-project instructions and reusable skills.",
        globalSkillSegments: [".claude", "skills"],
        projectSkillSegments: [".claude", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
    cursor: {
        id: "cursor",
        name: "Cursor",
        description: "Cursor workspace assistant with local skill bundles and project instructions.",
        globalSkillSegments: [".cursor", "skills"],
        projectSkillSegments: [".cursor", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
    "gemini-cli": {
        id: "gemini-cli",
        name: "Gemini CLI",
        description: "Gemini terminal workflow with reusable skills and project-level AGENTS.md guidance.",
        globalSkillSegments: [".gemini", "skills"],
        projectSkillSegments: [".gemini", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
    "copilot-cli": {
        id: "copilot-cli",
        name: "Copilot CLI",
        description: "GitHub Copilot command-line assistant with local skill and prompt context.",
        globalSkillSegments: [".copilot", "skills"],
        projectSkillSegments: [".copilot", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
    windsurf: {
        id: "windsurf",
        name: "Windsurf",
        description: "Windsurf coding workspace with reusable skills and project instruction files.",
        globalSkillSegments: [".windsurf", "skills"],
        projectSkillSegments: [".windsurf", "skills"],
        projectSupports: ["skills", "agents-md"],
    },
};

export function listSupportedApplications(): ApplicationDefinition[] {
    return Object.values(APPLICATION_CATALOG);
}

export function getApplicationDefinition(id: ApplicationId): ApplicationDefinition {
    return APPLICATION_CATALOG[id];
}
