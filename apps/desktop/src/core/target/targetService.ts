import {nanoid} from "nanoid";

import type {FileSystemPort} from "../ports/fileSystemPort";
import type {PathPort} from "../ports/pathPort";
import type {CreateTargetInput, TargetDeployMode, TargetRecord, UpdateTargetInput,} from "../types/target";
import type {TargetRepository} from "./targetRepository";

type TargetServiceDependencies = {
    fileSystem: FileSystemPort;
    path: PathPort;
    targetRepository: TargetRepository;
};

function isValidDeployMode(value: string): value is TargetDeployMode {
    return value === "copy" || value === "merge";
}

export class TargetService {
    private readonly fileSystem: FileSystemPort;
    private readonly path: PathPort;
    private readonly targetRepository: TargetRepository;

    constructor(dependencies: TargetServiceDependencies) {
        this.fileSystem = dependencies.fileSystem;
        this.path = dependencies.path;
        this.targetRepository = dependencies.targetRepository;
    }

    listTargets(): TargetRecord[] {
        return this.targetRepository.list();
    }

    getTarget(id: string): TargetRecord | null {
        return this.targetRepository.findById(id);
    }

    async createTarget(input: CreateTargetInput): Promise<TargetRecord> {
        const name = input.name.trim();
        const targetPath = input.path.trim();

        await this.validateTargetInput({
            name,
            path: targetPath,
            deployMode: input.deployMode,
        });

        const now = new Date().toISOString();
        const target: TargetRecord = {
            id: nanoid(),
            name,
            path: targetPath,
            enabled: true,
            deployMode: input.deployMode,
            created_at: now,
            updated_at: now,
        };

        this.targetRepository.create(target);

        return target;
    }

    async updateTarget(id: string, input: UpdateTargetInput): Promise<TargetRecord> {
        const current = this.targetRepository.findById(id);

        if (!current) {
            throw new Error(`Target not found: ${id}`);
        }

        const nextTarget: TargetRecord = {
            ...current,
            name: input.name?.trim() ?? current.name,
            path: input.path?.trim() ?? current.path,
            enabled: input.enabled ?? current.enabled,
            deployMode: input.deployMode ?? current.deployMode,
            updated_at: new Date().toISOString(),
        };

        await this.validateTargetInput(nextTarget, current.id);
        this.targetRepository.update(nextTarget);

        return nextTarget;
    }

    deleteTarget(id: string): void {
        const current = this.targetRepository.findById(id);

        if (!current) {
            throw new Error(`Target not found: ${id}`);
        }

        this.targetRepository.delete(id);
    }

    private async validateTargetInput(
        target: Pick<TargetRecord, "name" | "path" | "deployMode">,
        currentId?: string
    ): Promise<void> {
        if (!target.name) {
            throw new Error("Target name is required.");
        }

        if (!target.path) {
            throw new Error("Target path is required.");
        }

        if (!this.path.isAbsolute(target.path)) {
            throw new Error("Target path must be an absolute path.");
        }

        if (!(await this.fileSystem.exists(target.path))) {
            throw new Error("Target path does not exist.");
        }

        if (!isValidDeployMode(target.deployMode)) {
            throw new Error(`Unsupported deploy mode: ${target.deployMode}`);
        }

        const duplicatedTarget = this.targetRepository
            .list()
            .find((item) => item.path === target.path && item.id !== currentId);

        if (duplicatedTarget) {
            throw new Error("Target path is already configured.");
        }
    }
}
