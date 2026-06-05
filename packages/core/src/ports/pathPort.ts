export interface PathPort {
    join(...parts: string[]): string;
    isAbsolute(path: string): boolean;
    dirname(path: string): string;
    basename(path: string): string;
}
