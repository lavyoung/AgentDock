import {execFile} from "node:child_process";
import fs from "fs-extra";
import path from "node:path";
import {promisify} from "node:util";

import type {FileSystemPort} from "../../../../../packages/core/src/ports/fileSystemPort";
import type {PathPort} from "../../../../../packages/core/src/ports/pathPort";
import type {ShellPort} from "../../../../../packages/core/src/ports/shellPort";

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

export const nodeShellPort: ShellPort = {
    async commandExists(command) {
        try {
            await execFileAsync("where.exe", [command], {windowsHide: true});
            return true;
        } catch {
            return false;
        }
    },
};
