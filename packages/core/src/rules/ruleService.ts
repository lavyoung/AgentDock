import {nanoid} from "nanoid";

import type {RuleRecord, RuleSeverity} from "../types/asset";
import type {RuleRepository} from "./ruleRepository";

export type CreateRuleInput = {
    name: string;
    title?: string;
    description?: string;
    severity: RuleSeverity;
    enabled?: boolean;
};

export type UpdateRuleInput = Partial<
    Pick<RuleRecord, "name" | "title" | "description" | "severity" | "enabled">
>;

type RuleServiceDependencies = {
    ruleRepository: RuleRepository;
};

export class RuleService {
    private readonly ruleRepository: RuleRepository;

    constructor(dependencies: RuleServiceDependencies) {
        this.ruleRepository = dependencies.ruleRepository;
    }

    listRules(): RuleRecord[] {
        return this.ruleRepository.list();
    }

    getRule(id: string): RuleRecord | null {
        return this.ruleRepository.findById(id);
    }

    async createRule(input: CreateRuleInput): Promise<RuleRecord> {
        const name = input.name.trim();

        if (!name) {
            throw new Error("Rule name is required.");
        }

        const duplicated = this.ruleRepository.findByName(name);
        if (duplicated) {
            throw new Error(`Rule name already exists: ${name}`);
        }

        const now = new Date().toISOString();
        const record: RuleRecord = {
            id: nanoid(),
            name,
            title: input.title?.trim() || name,
            description: input.description ?? "",
            severity: input.severity,
            enabled: input.enabled ?? true,
            created_at: now,
            updated_at: now,
        };

        this.ruleRepository.create(record);

        return record;
    }

    async updateRule(id: string, input: UpdateRuleInput): Promise<RuleRecord> {
        const current = this.ruleRepository.findById(id);
        if (!current) {
            throw new Error(`Rule not found: ${id}`);
        }

        const next: RuleRecord = {
            ...current,
            name: input.name?.trim() ?? current.name,
            title: input.title?.trim() ?? current.title,
            description: input.description ?? current.description,
            severity: input.severity ?? current.severity,
            enabled: input.enabled ?? current.enabled,
            updated_at: new Date().toISOString(),
        };

        if (next.name !== current.name) {
            const dup = this.ruleRepository.findByName(next.name);
            if (dup) {
                throw new Error(`Rule name already exists: ${next.name}`);
            }
        }

        this.ruleRepository.update(next);

        return next;
    }

    deleteRule(id: string): void {
        const current = this.ruleRepository.findById(id);
        if (!current) {
            throw new Error(`Rule not found: ${id}`);
        }

        this.ruleRepository.delete(id);
    }
}