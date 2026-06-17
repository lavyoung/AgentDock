/**
 * Sync-domain constants.
 *
 * These names are part of the on-disk contract AgentDock writes into target
 * directories. They are exported so that any sync helper — both within
 * `packages/core/src/sync/*` and the per-service code that consumes it — can
 * agree on the directory layout without re-typing string literals everywhere.
 *
 * Keep this list small and stable. The canonical on-disk layout is:
 *
 *   <target-root>/skills/<asset.id>/SKILL.md     (skill)
 *   <target-root>/AGENTS.md                      (agents-md, managed block)
 *
 * The skill directory is keyed on `asset.id` (not `asset.name`) so the path
 * is stable across renames. See `syncPlannerHelpers.resolveSkillOutputPath`
 * for the rule.
 */

export const SKILLS_DIR = "skills";

export const AGENTS_FILE = "AGENTS.md";

/**
 * Sub-directory inside a target that holds individual skill bundles.
 * The trailing slash is intentionally omitted — callers `path.join` it.
 */
export const SKILLS_OUTPUT_DIR = SKILLS_DIR;

/**
 * File name used to mark a target as participating in a managed-block
 * merge. Always at the target root (not nested under a per-asset folder).
 */
export const AGENTS_OUTPUT_FILE = AGENTS_FILE;
