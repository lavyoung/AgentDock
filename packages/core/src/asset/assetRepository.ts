import type {AssetRecord} from "../types/asset";

export interface AssetRepository {
    list(): AssetRecord[];
    findById(id: string): AssetRecord | null;
    create(asset: AssetRecord): void;
    updateDetails(
        id: string,
        changes: Pick<AssetRecord, "title" | "description" | "status" | "updated_at">
    ): void;
    touch(id: string, updatedAt: string): void;
}
