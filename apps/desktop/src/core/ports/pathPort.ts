export interface PathPort {
    join(...parts: string[]): string;
    isAbsolute(path: string): boolean;
}
