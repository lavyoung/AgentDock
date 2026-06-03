import type {ScenarioRecord} from "../types/asset";

export interface ScenarioRepository {
    list(): ScenarioRecord[];
    findById(id: string): ScenarioRecord | null;
    create(scenario: ScenarioRecord): void;
    update(scenario: ScenarioRecord): void;
    delete(id: string): void;
    addAssetId(
        id: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): void;
    removeAssetId(
        id: string,
        field: "skillIds" | "ruleIds" | "agentFileIds",
        assetId: string
    ): void;
    count(): number;
    findByName(name: string): ScenarioRecord | null;
}