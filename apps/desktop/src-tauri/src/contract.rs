//! Shared contract DTOs for the Tauri runtime.
//!
//! These types are the **wire shape** of every Tauri command surfaced by
//! `apps/desktop/src-tauri/src/commands.rs`. They MUST stay in lockstep with
//! the TypeScript contract in `packages/shared/src/contract/*` and the
//! `AgentdockApi` surface declared in
//! `packages/shared/src/agentdockApi.ts`.
//!
//! Wire-format rules enforced here:
//!
//!   1. Field names mirror the TypeScript contract exactly. Most fields are
//!      snake_case, but legacy transport DTOs still include a few camelCase
//!      keys such as `deployMode`, `skillIds`, and `defaultPath`; those must
//!      be preserved with explicit `serde(rename = "...")`.
//!   2. Enum variants are serialized via `rename_all = "lowercase"` for
//!      simple literal unions (`"active"`, `"success"`, ...) and
//!      `rename_all = "kebab-case"` for unions that contain hyphens
//!      (`"agents-md"`, `"claude-code"`, ...). The renamed strings
//!      exactly match the TS literal-union values.
//!   3. Optional fields are `Option<T>` so the renderer can serialize
//!      them as `null` consistently.
//!
//! Any change to the TS contract MUST be mirrored here in the same commit.
//! Any new contract type MUST be added to both layers before a Tauri
//! command can return it.

use serde::{Deserialize, Serialize};

// =========================================================================
// assets / rules / scenarios
// =========================================================================

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum AssetType {
    Skill,
    AgentsMd,
    Rule,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AssetStatus {
    Active,
    Disabled,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RuleSeverity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AssetRecord {
    pub id: String,
    #[serde(rename = "type")]
    pub asset_type: AssetType,
    pub name: String,
    pub title: String,
    pub description: String,
    pub version: String,
    pub status: AssetStatus,
    pub path: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetDetail {
    #[serde(flatten)]
    pub record: AssetRecord,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAssetInput {
    #[serde(rename = "type")]
    pub asset_type: AssetType,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateAssetInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<AssetStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RuleRecord {
    pub id: String,
    pub name: String,
    pub title: String,
    pub description: String,
    pub severity: RuleSeverity,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ScenarioRecord {
    pub id: String,
    pub name: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "skillIds")]
    pub skill_ids: Vec<String>,
    #[serde(rename = "ruleIds")]
    pub rule_ids: Vec<String>,
    #[serde(rename = "agentFileIds")]
    pub agent_file_ids: Vec<String>,
    #[serde(rename = "agentAppIds")]
    pub agent_app_ids: Vec<String>,
    #[serde(rename = "projectIds")]
    pub project_ids: Vec<String>,
    #[serde(rename = "isBuiltIn")]
    pub is_built_in: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScenarioCreateInput {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateScenarioInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "skillIds", skip_serializing_if = "Option::is_none")]
    pub skill_ids: Option<Vec<String>>,
    #[serde(rename = "ruleIds", skip_serializing_if = "Option::is_none")]
    pub rule_ids: Option<Vec<String>>,
    #[serde(rename = "agentFileIds", skip_serializing_if = "Option::is_none")]
    pub agent_file_ids: Option<Vec<String>>,
    #[serde(rename = "agentAppIds", skip_serializing_if = "Option::is_none")]
    pub agent_app_ids: Option<Vec<String>>,
    #[serde(rename = "projectIds", skip_serializing_if = "Option::is_none")]
    pub project_ids: Option<Vec<String>>,
    #[serde(rename = "isBuiltIn", skip_serializing_if = "Option::is_none")]
    pub is_built_in: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ScenarioAssetField {
    SkillIds,
    RuleIds,
    AgentFileIds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScenarioAssetMutationInput {
    #[serde(rename = "scenarioId")]
    pub scenario_id: String,
    pub field: ScenarioAssetField,
    #[serde(rename = "assetId")]
    pub asset_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCreateInput {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub severity: RuleSeverity,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateRuleInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub severity: Option<RuleSeverity>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

// =========================================================================
// targets
// =========================================================================

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TargetDeployMode {
    Copy,
    Merge,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TargetRecord {
    pub id: String,
    pub name: String,
    pub path: String,
    pub enabled: bool,
    #[serde(rename = "deployMode")]
    pub deploy_mode: TargetDeployMode,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTargetInput {
    pub name: String,
    pub path: String,
    #[serde(rename = "deployMode")]
    pub deploy_mode: TargetDeployMode,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateTargetInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
    #[serde(rename = "deployMode", skip_serializing_if = "Option::is_none")]
    pub deploy_mode: Option<TargetDeployMode>,
}

// =========================================================================
// snapshots
// =========================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SnapshotRecord {
    pub id: String,
    pub asset_id: String,
    pub snapshot_path: String,
    pub message: String,
    pub created_at: String,
}

// =========================================================================
// sync
// =========================================================================

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SyncOperationKind {
    Create,
    Update,
    Merge,
    Delete,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SyncPlanItem {
    pub asset_id: String,
    pub asset_name: String,
    pub asset_type: AssetType,
    pub target_id: String,
    pub target_name: String,
    pub target_root: String,
    pub output_path: String,
    pub operation: SyncOperationKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SyncInlineTarget {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(rename = "deployMode")]
    pub deploy_mode: TargetDeployMode,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SyncRunConflict {
    pub asset_id: String,
    pub asset_name: String,
    pub asset_type: AssetType,
    pub target_id: String,
    pub target_name: String,
    pub output_path: String,
    pub reason: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SyncHistoryStatus {
    Success,
    Warning,
    Conflict,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SyncHistoryOutput {
    pub asset_id: String,
    pub asset_name: String,
    pub asset_type: AssetType,
    pub target_id: String,
    pub target_name: String,
    pub output_path: String,
    pub operation: SyncOperationKind,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncPreviewInput {
    pub scenario_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inline_targets: Option<Vec<SyncInlineTarget>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tracked_outputs: Option<Vec<SyncHistoryOutput>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncCleanupInput {
    pub tracked_outputs: Vec<SyncHistoryOutput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncPreviewResult {
    pub scenario_id: String,
    pub target_count: u32,
    pub operation_count: u32,
    pub create_count: u32,
    pub update_count: u32,
    pub merge_count: u32,
    pub delete_count: u32,
    pub warnings: Vec<String>,
    pub items: Vec<SyncPlanItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncHistoryEntry {
    pub id: String,
    pub scenario_id: String,
    pub synced_at: String,
    pub target_count: u32,
    pub operation_count: u32,
    pub written_count: u32,
    pub warning_count: u32,
    pub conflict_count: u32,
    pub status: SyncHistoryStatus,
    pub warnings: Vec<String>,
    pub conflicts: Vec<SyncRunConflict>,
    pub outputs: Vec<SyncHistoryOutput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRunResult {
    #[serde(flatten)]
    pub preview: SyncPreviewResult,
    pub written_count: u32,
    pub conflicts: Vec<SyncRunConflict>,
    pub synced_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncCleanupResult {
    pub cleaned_count: u32,
    pub conflict_count: u32,
    pub warnings: Vec<String>,
    pub conflicts: Vec<SyncRunConflict>,
    pub cleaned_at: String,
}

// =========================================================================
// applications
// =========================================================================

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ApplicationId {
    Codex,
    ClaudeCode,
    Cursor,
    GeminiCli,
    CopilotCli,
    Windsurf,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ApplicationLocationKind {
    Skills,
    AgentsMd,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ApplicationLocationScope {
    Global,
    Project,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ApplicationLocationSource {
    Detected,
    Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApplicationRecord {
    pub id: ApplicationId,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub total_locations: u32,
    pub enabled_locations: u32,
    pub existing_locations: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApplicationLocationRecord {
    pub id: String,
    pub application_id: ApplicationId,
    pub location_key: String,
    pub target_id: Option<String>,
    pub name: String,
    pub kind: ApplicationLocationKind,
    pub scope: ApplicationLocationScope,
    pub path: String,
    pub exists: bool,
    pub enabled: bool,
    pub source: ApplicationLocationSource,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApplicationDetail {
    pub application: ApplicationRecord,
    pub locations: Vec<ApplicationLocationRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateApplicationInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateApplicationLocationInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApplicationSyncConflict {
    pub asset_id: String,
    pub location_id: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationSyncResult {
    pub application_id: ApplicationId,
    pub synced_skills: u32,
    pub synced_agents_md: u32,
    pub touched_locations: u32,
    pub conflicts: Vec<ApplicationSyncConflict>,
    pub synced_at: String,
}

// =========================================================================
// shell (renderer-side window chrome)
// =========================================================================

/// Renderer-pushed theme override. Mirrors `ShellTheme` in
/// `apps/desktop/src/renderer/client/shellTypes.ts`.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ShellTheme {
    Dark,
    Light,
}

// =========================================================================
// app
// =========================================================================

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum PickPathMode {
    Directory,
    AgentsMdFile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PickPathInput {
    pub mode: PickPathMode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "defaultPath", skip_serializing_if = "Option::is_none")]
    pub default_path: Option<String>,
    #[serde(rename = "buttonLabel", skip_serializing_if = "Option::is_none")]
    pub button_label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotListInput {
    #[serde(rename = "assetId")]
    pub asset_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotRestoreInput {
    #[serde(rename = "snapshotId")]
    pub snapshot_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationScenarioSyncInput {
    pub id: ApplicationId,
    #[serde(rename = "scenarioId")]
    pub scenario_id: String,
}

// =========================================================================
// generic envelopes
// =========================================================================

/// Envelope returned from every delete / restore-style command. Mirrors the
/// `{deleted, asset_id}` / `{restored, asset_id, snapshot_id}` shapes the
/// Electron IPC handlers already produce.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeletedAsset {
    pub deleted: bool,
    pub asset_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeletedTarget {
    pub deleted: bool,
    pub target_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeletedRule {
    pub deleted: bool,
    pub rule_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeletedScenario {
    pub deleted: bool,
    pub scenario_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RestoredSnapshot {
    pub restored: bool,
    pub asset_id: String,
    pub snapshot_id: String,
}

#[cfg(test)]
mod tests {
    use serde_json::{json, Value};

    use super::*;

    fn as_json<T>(value: &T) -> Value
    where
        T: Serialize,
    {
        serde_json::to_value(value).expect("value should serialize")
    }

    #[test]
    fn scenario_record_preserves_legacy_camel_case_fields() {
        let value = as_json(&ScenarioRecord {
            id: "scenario-1".into(),
            name: "demo".into(),
            title: "Demo".into(),
            description: "desc".into(),
            skill_ids: vec!["asset-skill".into()],
            rule_ids: vec!["asset-rule".into()],
            agent_file_ids: vec!["asset-agent-file".into()],
            agent_app_ids: vec!["asset-agent-app".into()],
            project_ids: vec!["project-1".into()],
            is_built_in: true,
            created_at: "2026-06-18T00:00:00Z".into(),
            updated_at: "2026-06-18T00:00:00Z".into(),
        });

        assert_eq!(value["skillIds"], json!(["asset-skill"]));
        assert_eq!(value["ruleIds"], json!(["asset-rule"]));
        assert_eq!(value["agentFileIds"], json!(["asset-agent-file"]));
        assert_eq!(value["agentAppIds"], json!(["asset-agent-app"]));
        assert_eq!(value["projectIds"], json!(["project-1"]));
        assert_eq!(value["isBuiltIn"], json!(true));
        assert!(value.get("skill_ids").is_none());
        assert!(value.get("is_built_in").is_none());
    }

    #[test]
    fn target_and_pick_path_inputs_match_shared_contract_keys() {
        let target = as_json(&CreateTargetInput {
            name: "Target".into(),
            path: "C:/target".into(),
            deploy_mode: TargetDeployMode::Merge,
        });
        let pick_path = as_json(&PickPathInput {
            mode: PickPathMode::AgentsMdFile,
            title: Some("Pick file".into()),
            default_path: Some("C:/repo/AGENTS.md".into()),
            button_label: Some("Choose".into()),
        });

        assert_eq!(target["deployMode"], json!("merge"));
        assert!(target.get("deploy_mode").is_none());
        assert_eq!(pick_path["defaultPath"], json!("C:/repo/AGENTS.md"));
        assert_eq!(pick_path["buttonLabel"], json!("Choose"));
        assert!(pick_path.get("default_path").is_none());
        assert!(pick_path.get("button_label").is_none());
    }

    #[test]
    fn command_input_dtos_use_expected_argument_names() {
        let scenario_asset = as_json(&ScenarioAssetMutationInput {
            scenario_id: "scenario-1".into(),
            field: ScenarioAssetField::AgentFileIds,
            asset_id: "asset-1".into(),
        });
        let snapshot = as_json(&SnapshotListInput {
            asset_id: "asset-1".into(),
        });
        let app_sync = as_json(&ApplicationScenarioSyncInput {
            id: ApplicationId::Codex,
            scenario_id: "scenario-1".into(),
        });
        let update_rule = as_json(&UpdateRuleInput {
            severity: Some(RuleSeverity::Warning),
            enabled: Some(false),
            ..Default::default()
        });

        assert_eq!(scenario_asset["scenarioId"], json!("scenario-1"));
        assert_eq!(scenario_asset["field"], json!("agentFileIds"));
        assert_eq!(scenario_asset["assetId"], json!("asset-1"));
        assert!(scenario_asset.get("scenario_id").is_none());
        assert_eq!(snapshot["assetId"], json!("asset-1"));
        assert_eq!(app_sync["scenarioId"], json!("scenario-1"));
        assert_eq!(update_rule["severity"], json!("warning"));
        assert_eq!(update_rule["enabled"], json!(false));
    }
}
