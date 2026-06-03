import type {RuleRecord} from "../types/asset";

export interface RuleRepository {
    list(): RuleRecord[];
    findById(id: string): RuleRecord | null;
    findByName(name: string): RuleRecord | null;
    create(rule: RuleRecord): void;
    update(rule: RuleRecord): void;
    delete(id: string): void;
}