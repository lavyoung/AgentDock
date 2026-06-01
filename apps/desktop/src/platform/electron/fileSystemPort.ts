import fs from "fs-extra";
import path from "node:path";

import type {FileSystemPort} from "../../core/ports/fileSystemPort";
import type {PathPort} from "../../core/ports/pathPort";

export const nodeFileSystemPort: FileSystemPort = {
    exists(targetPath) {
        return fs.pathExists(targetPath);
    },
    readText(targetPath) {
        return fs.readFile(targetPath, "utf-8");
    },
    writeText(targetPath, content) {
        return fs.writeFile(targetPath, content, "utf-8");
    },
    ensureDir(targetPath) {
        return fs.ensureDir(targetPath);
    },
    copyDir(from, to) {
        return fs.copy(from, to, {
            overwrite: false,
            errorOnExist: true,
        });
    },
    emptyDir(targetPath) {
        return fs.emptyDir(targetPath);
    },
};

export const nodePathPort: PathPort = {
    join(...parts) {
        return path.join(...parts);
    },
    isAbsolute(targetPath) {
        return path.isAbsolute(targetPath);
    },
};
