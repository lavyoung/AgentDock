import type {ApplicationId, ApplicationLocationKind} from "../types/application";

export type ApplicationDefinition = {
    id: ApplicationId;
    name: string;
    description: string;
    globalSkillSegments: string[];
    projectSkillSegments: string[];
    projectSupports: ApplicationLocationKind[];
    installCheckSegments: string[][];
    installCheckCommands?: string[];
};

export const APPLICATION_CATALOG: Record<ApplicationId, ApplicationDefinition> = {
    codex: {
        id: "codex",
        name: "Codex",
        description: "OpenAI local coding agent with shared global skills and project-scoped AGENTS.md.",
        globalSkillSegments: [".codex", "skills"],
        projectSkillSegments: [".codex", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Roaming", "npm", "codex.cmd"],
            ["AppData", "Roaming", "npm", "codex"],
            [".local", "bin", "codex"],
            [".local", "bin", "codex.exe"],
            [".codex"],
        ],
        installCheckCommands: ["codex"],
    },
    "claude-code": {
        id: "claude-code",
        name: "Claude Code",
        description: "Anthropic coding workflow with per-project instructions and reusable skills.",
        globalSkillSegments: [".claude", "skills"],
        projectSkillSegments: [".claude", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Roaming", "npm", "claude.cmd"],
            ["AppData", "Roaming", "npm", "claude"],
            ["AppData", "Roaming", "npm", "node_modules", "@anthropic-ai", "claude-code"],
            [".local", "bin", "claude"],
            [".local", "bin", "claude.exe"],
            [".claude"],
            [".claude.json"],
        ],
        installCheckCommands: ["claude"],
    },
    cursor: {
        id: "cursor",
        name: "Cursor",
        description: "Cursor workspace assistant with local skill bundles and project instructions.",
        globalSkillSegments: [".cursor", "skills"],
        projectSkillSegments: [".cursor", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Local", "Programs", "Cursor", "Cursor.exe"],
            ["AppData", "Local", "cursor", "Cursor.exe"],
            [".cursor"],
        ],
    },
    "gemini-cli": {
        id: "gemini-cli",
        name: "Gemini CLI",
        description: "Gemini terminal workflow with reusable skills and project-level AGENTS.md guidance.",
        globalSkillSegments: [".gemini", "skills"],
        projectSkillSegments: [".gemini", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Roaming", "npm", "gemini.cmd"],
            ["AppData", "Roaming", "npm", "gemini"],
            [".local", "bin", "gemini"],
            [".local", "bin", "gemini.exe"],
            [".gemini"],
        ],
        installCheckCommands: ["gemini"],
    },
    "copilot-cli": {
        id: "copilot-cli",
        name: "Copilot CLI",
        description: "GitHub Copilot command-line assistant with local skill and prompt context.",
        globalSkillSegments: [".copilot", "skills"],
        projectSkillSegments: [".copilot", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Roaming", "npm", "github-copilot-cli.cmd"],
            ["AppData", "Roaming", "npm", "github-copilot-cli"],
            ["AppData", "Roaming", "npm", "node_modules", "@githubnext", "github-copilot-cli"],
            [".local", "bin", "github-copilot-cli"],
            [".local", "bin", "github-copilot-cli.exe"],
            [".copilot"],
        ],
        installCheckCommands: ["github-copilot-cli"],
    },
    windsurf: {
        id: "windsurf",
        name: "Windsurf",
        description: "Windsurf coding workspace with reusable skills and project instruction files.",
        globalSkillSegments: [".windsurf", "skills"],
        projectSkillSegments: [".windsurf", "skills"],
        projectSupports: ["skills", "agents-md"],
        installCheckSegments: [
            ["AppData", "Local", "Programs", "Windsurf", "Windsurf.exe"],
            ["AppData", "Roaming", "npm", "windsurf.cmd"],
            ["AppData", "Roaming", "npm", "windsurf"],
        ],
        installCheckCommands: ["windsurf"],
    },
};

export function listSupportedApplications(): ApplicationDefinition[] {
    return Object.values(APPLICATION_CATALOG);
}

export function getApplicationDefinition(id: ApplicationId): ApplicationDefinition {
    return APPLICATION_CATALOG[id];
}
