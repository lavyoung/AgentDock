export interface FileSystemPort {
    exists(path: string): Promise<boolean>;
    readText(path: string): Promise<string>;
    writeText(path: string, content: string): Promise<void>;
    ensureDir(path: string): Promise<void>;
    copyDir(from: string, to: string): Promise<void>;
    emptyDir(path: string): Promise<void>;
    remove(path: string): Promise<void>;
    commandExists?(command: string): Promise<boolean>;
}
