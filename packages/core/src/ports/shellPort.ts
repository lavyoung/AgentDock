export interface ShellPort {
    /**
     * Returns true when a shell-resolvable command exists on the current
     * PATH. Platform-specific implementation may use `which`, `where.exe`,
     * or a Rust equivalent. Should never throw — return false on lookup
     * errors so callers can use it as a soft probe.
     */
    commandExists(command: string): Promise<boolean>;
}
