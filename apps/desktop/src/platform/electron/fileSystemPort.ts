import fs from "fs-extra";
import path from "node:path";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

import type {FileSystemPort} from "../../../../../packages/core/src/ports/fileSystemPort";
import type {PathPort} from "../../../../../packages/core/src/ports/pathPort";

const execFileAsync = promisify(execFile);

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
    remove(targetPath) {
        return fs.remove(targetPath);
    },
    async commandExists(command) {
        try {
            await execFileAsync("where.exe", [command], {windowsHide: true});
            return true;
        } catch {
            return false;
        }
    },
};

export const nodePathPort: PathPort = {
    join(...parts) {
        return path.join(...parts);
    },
    isAbsolute(targetPath) {
        return path.isAbsolute(targetPath);
    },
    dirname(targetPath) {
        return path.dirname(targetPath);
    },
    basename(targetPath) {
        return path.basename(targetPath);
    },
};
