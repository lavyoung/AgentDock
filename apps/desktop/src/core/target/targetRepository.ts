import type {TargetRecord} from "../types/target";

export interface TargetRepository {
    list(): TargetRecord[];
    findById(id: string): TargetRecord | null;
    create(target: TargetRecord): void;
    update(target: TargetRecord): void;
    delete(id: string): void;
}
