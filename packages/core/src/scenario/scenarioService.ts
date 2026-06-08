import {nanoid} from "nanoid";

import type {ScenarioRecord} from "../types/asset";
import type {ScenarioRepository} from "./scenarioRepository";

export type CreateScenarioInput = {
    name: string;
    title?: string;
    description?: string;
};

export type UpdateScenarioInput = Partial<
    Pick<ScenarioRecord, "name" | "title" | "description" | "skillIds" | "ruleIds" | "agentFileIds" | "agentAppIds" | "projectIds">
>;

type ScenarioServiceDependencies = {
    scenarioRepository: ScenarioRepository;
    bootstrapDefault?: () => void;
};

export class ScenarioService {
    private readonly scenarioRepository: ScenarioRepository;
    private readonly bootstrapDefault?: () => void;

    constructor(dependencies: ScenarioServiceDependencies) {
        this.scenarioRepository = dependencies.scenarioRepository;
        this.bootstrapDefault = dependencies.bootstrapDefault;
    }

    listScenarios(): ScenarioRecord[] {
        this.bootstrapDefault?.();
        return this.scenarioRepository.list();
    }

    getScenario(id: string): ScenarioRecord | null {
        this.bootstrapDefault?.();
        return this.scenarioRepository.findById(id);
    }

    async createScenario(input: CreateScenarioInput): Promise<ScenarioRecord> {
        const name = input.name.trim();

        if (!name) {
            throw new Error("Scenario name is required.");
        }

        const duplicated = this.scenarioRepository.findByName(name);

        if (duplicated) {
            throw new Error(`Scenario name already exists: ${name}`);
        }

        const now = new Date().toISOString();
        const record: ScenarioRecord = {
            id: nanoid(),
            name,
            title: input.title?.trim() || name,
            description: input.description ?? "",
            skillIds: [],
            ruleIds: [],
            agentFileIds: [],
            agentAppIds: [],
            projectIds: [],
            isBuiltIn: false,
            created_at: now,
            updated_at: now,
        };

        this.scenarioRepository.create(record);

        return record;
    }

    async updateScenario(id: string, input: UpdateScenarioInput): Promise<ScenarioRecord> {
        const current = this.scenarioRepository.findById(id);

        if (!current) {
            throw new Error(`Scenario not found: ${id}`);
        }

        if (current.isBuiltIn && input.name && input.name !== current.name) {
            throw new Error("Built-in scenario name cannot be changed.");
        }

        const next: ScenarioRecord = {
            ...current,
            name: input.name?.trim() ?? current.name,
            title: input.title?.trim() ?? current.title,
            description: input.description ?? current.description,
            skillIds: input.skillIds ?? current.skillIds,
            ruleIds: input.ruleIds ?? current.ruleIds,
            agentFileIds: input.agentFileIds ?? current.agentFileIds,
            agentAppIds: input.agentAppIds ?? current.agentAppIds,
            projectIds: input.projectIds ?? current.projectIds,
            updated_at: new Date().toISOString(),
        };

        if (next.name !== current.name) {
            const dup = this.scenarioRepository.findByName(next.name);

            if (dup) {
                throw new Error(`Scenario name already exists: ${next.name}`);
            }
        }

        this.scenarioRepository.update(next);

        return next;
    }

    deleteScenario(id: string): void {
        const current = this.scenarioRepository.findById(id);

        if (!current) {
            throw new Error(`Scenario not found: ${id}`);
        }

        if (current.isBuiltIn) {
            throw new Error("Built-in scenario cannot be deleted.");
        }

        this.scenarioRepository.delete(id);
    }

    async addAssetToScenario(
        scenarioId: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): Promise<ScenarioRecord> {
        const current = this.scenarioRepository.findById(scenarioId);

        if (!current) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        if (field === "agentFileIds") {
            this.scenarioRepository.update({
                ...current,
                agentFileIds: [assetId],
                updated_at: new Date().toISOString(),
            });
            return this.scenarioRepository.findById(scenarioId)!;
        }

        this.scenarioRepository.addAssetId(scenarioId, field, assetId);
        const next = this.scenarioRepository.findById(scenarioId);
        this.scenarioRepository.update({...next!, updated_at: new Date().toISOString()});

        return this.scenarioRepository.findById(scenarioId)!;
    }

    async removeAssetFromScenario(
        scenarioId: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): Promise<ScenarioRecord> {
        const current = this.scenarioRepository.findById(scenarioId);

        if (!current) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        this.scenarioRepository.removeAssetId(scenarioId, field, assetId);
        const next = this.scenarioRepository.findById(scenarioId);
        this.scenarioRepository.update({...next!, updated_at: new Date().toISOString()});

        return this.scenarioRepository.findById(scenarioId)!;
    }
}
