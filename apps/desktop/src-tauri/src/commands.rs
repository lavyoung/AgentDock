//! Tauri command boundary.
//!
//! Every method declared on the shared `AgentdockApi` interface
//! (`packages/shared/src/agentdockApi.ts`) has a stub command here that
//! matches the **same wire shape**: same input DTO, same return DTO, same
//! error envelope. Phase 1 of the Tauri port only fills in command names
//! and types — bodies return `AppError::not_implemented("<cmd>")`.
//! Phase 2 swaps each body for the real Rust port of the corresponding
//! `packages/core/src/*` service, without changing the wire.
//!
//! Naming convention (locked in this module — do not change without
//! updating every renderer consumer):
//!
//!   `AgentdockApi.<namespace>.<method>`  →  Rust command `<namespace>_<method>`
//!
//! Examples:
//!
//!   `AgentdockApi.assets.list`            →  `assets_list`
//!   `AgentdockApi.applications.runSync`   →  `applications_run_sync`
//!   `AgentdockApi.sync.cleanup`           →  `sync_cleanup`
//!
//! Renderer-side shell commands follow the same `<domain>_<verb>` pattern
//! (`window_ready`, `window_set_overlay`) so the entire Tauri command
//! surface can be enumerated from a single source of truth.
//!
//! Renderer routing: the existing `agentdockClient` (in
//! `apps/desktop/src/renderer/client/agentdockClient.ts`) reads
//! `window.agentdock`. When a Phase-2 Tauri bootstrap installs a proxy
//! onto that global — translating each `assets_list` call into
//! `invoke("assets_list", ...)` — every page keeps working unchanged.
//! No renderer changes are required to consume these commands.

use tauri::command;

use crate::contract::{
    ApplicationDetail, ApplicationId, ApplicationLocationRecord, ApplicationRecord,
    ApplicationScenarioSyncInput, ApplicationSyncResult, AssetDetail, AssetRecord, AssetStatus,
    CreateAssetInput, CreateTargetInput, DeletedAsset, DeletedRule, DeletedScenario, DeletedTarget,
    PickPathInput, RestoredSnapshot, RuleCreateInput, RuleRecord, ScenarioAssetMutationInput,
    ScenarioCreateInput, ScenarioRecord, ShellTheme, SnapshotListInput, SnapshotRecord,
    SnapshotRestoreInput, SyncCleanupInput, SyncCleanupResult, SyncPreviewInput, SyncPreviewResult,
    SyncRunResult, TargetRecord, UpdateApplicationInput, UpdateApplicationLocationInput,
    UpdateAssetInput, UpdateRuleInput, UpdateScenarioInput, UpdateTargetInput,
};
use crate::error::{AppError, AppResult};

// =========================================================================
// app
// =========================================================================

/// Mirrors `AgentdockApi.app.pickPath`.
#[command]
pub async fn app_pick_path(_input: PickPathInput) -> AppResult<Option<String>> {
    Err(AppError::not_implemented("app_pick_path"))
}

// =========================================================================
// assets
// =========================================================================

/// Mirrors `AgentdockApi.assets.list`.
#[command]
pub async fn assets_list() -> AppResult<Vec<AssetRecord>> {
    Err(AppError::not_implemented("assets_list"))
}

/// Mirrors `AgentdockApi.assets.get`.
#[command]
pub async fn assets_get(_id: String) -> AppResult<Option<AssetDetail>> {
    Err(AppError::not_implemented("assets_get"))
}

/// Mirrors `AgentdockApi.assets.create`.
#[command]
pub async fn assets_create(_input: CreateAssetInput) -> AppResult<AssetRecord> {
    Err(AppError::not_implemented("assets_create"))
}

/// Mirrors `AgentdockApi.assets.update`.
#[command]
pub async fn assets_update(
    _id: String,
    _input: UpdateAssetInput,
) -> AppResult<Option<AssetDetail>> {
    Err(AppError::not_implemented("assets_update"))
}

/// Mirrors `AgentdockApi.assets.setStatus`.
#[command]
pub async fn assets_set_status(
    _id: String,
    _status: AssetStatus,
) -> AppResult<Option<AssetRecord>> {
    Err(AppError::not_implemented("assets_set_status"))
}

/// Mirrors `AgentdockApi.assets.delete`.
#[command]
pub async fn assets_delete(_id: String) -> AppResult<DeletedAsset> {
    Err(AppError::not_implemented("assets_delete"))
}

// =========================================================================
// rules
// =========================================================================

/// Mirrors `AgentdockApi.rules.list`.
#[command]
pub async fn rules_list() -> AppResult<Vec<RuleRecord>> {
    Err(AppError::not_implemented("rules_list"))
}

/// Mirrors `AgentdockApi.rules.get`.
#[command]
pub async fn rules_get(_id: String) -> AppResult<Option<RuleRecord>> {
    Err(AppError::not_implemented("rules_get"))
}

/// Mirrors `AgentdockApi.rules.create`.
#[command]
pub async fn rules_create(_input: RuleCreateInput) -> AppResult<RuleRecord> {
    Err(AppError::not_implemented("rules_create"))
}

/// Mirrors `AgentdockApi.rules.update` (partial rule patch).
#[command]
pub async fn rules_update(_id: String, _input: UpdateRuleInput) -> AppResult<RuleRecord> {
    Err(AppError::not_implemented("rules_update"))
}

/// Mirrors `AgentdockApi.rules.delete`.
#[command]
pub async fn rules_delete(_id: String) -> AppResult<DeletedRule> {
    Err(AppError::not_implemented("rules_delete"))
}

// =========================================================================
// snapshots
// =========================================================================

/// Mirrors `AgentdockApi.snapshots.list`.
#[command]
pub async fn snapshots_list(_input: SnapshotListInput) -> AppResult<Vec<SnapshotRecord>> {
    Err(AppError::not_implemented("snapshots_list"))
}

/// Mirrors `AgentdockApi.snapshots.restore`.
#[command]
pub async fn snapshots_restore(_input: SnapshotRestoreInput) -> AppResult<RestoredSnapshot> {
    Err(AppError::not_implemented("snapshots_restore"))
}

// =========================================================================
// targets
// =========================================================================

/// Mirrors `AgentdockApi.targets.list`.
#[command]
pub async fn targets_list() -> AppResult<Vec<TargetRecord>> {
    Err(AppError::not_implemented("targets_list"))
}

/// Mirrors `AgentdockApi.targets.get`.
#[command]
pub async fn targets_get(_id: String) -> AppResult<Option<TargetRecord>> {
    Err(AppError::not_implemented("targets_get"))
}

/// Mirrors `AgentdockApi.targets.create`.
#[command]
pub async fn targets_create(_input: CreateTargetInput) -> AppResult<TargetRecord> {
    Err(AppError::not_implemented("targets_create"))
}

/// Mirrors `AgentdockApi.targets.update`.
#[command]
pub async fn targets_update(_id: String, _input: UpdateTargetInput) -> AppResult<TargetRecord> {
    Err(AppError::not_implemented("targets_update"))
}

/// Mirrors `AgentdockApi.targets.delete`.
#[command]
pub async fn targets_delete(_id: String) -> AppResult<DeletedTarget> {
    Err(AppError::not_implemented("targets_delete"))
}

// =========================================================================
// scenarios
// =========================================================================

/// Mirrors `AgentdockApi.scenarios.list`.
#[command]
pub async fn scenarios_list() -> AppResult<Vec<ScenarioRecord>> {
    Err(AppError::not_implemented("scenarios_list"))
}

/// Mirrors `AgentdockApi.scenarios.get`.
#[command]
pub async fn scenarios_get(_id: String) -> AppResult<Option<ScenarioRecord>> {
    Err(AppError::not_implemented("scenarios_get"))
}

/// Mirrors `AgentdockApi.scenarios.create`.
#[command]
pub async fn scenarios_create(_input: ScenarioCreateInput) -> AppResult<ScenarioRecord> {
    Err(AppError::not_implemented("scenarios_create"))
}

/// Mirrors `AgentdockApi.scenarios.update` (partial scenario patch).
#[command]
pub async fn scenarios_update(
    _id: String,
    _input: UpdateScenarioInput,
) -> AppResult<ScenarioRecord> {
    Err(AppError::not_implemented("scenarios_update"))
}

/// Mirrors `AgentdockApi.scenarios.delete`.
#[command]
pub async fn scenarios_delete(_id: String) -> AppResult<DeletedScenario> {
    Err(AppError::not_implemented("scenarios_delete"))
}

/// Mirrors `AgentdockApi.scenarios.addAsset`.
#[command]
pub async fn scenarios_add_asset(_input: ScenarioAssetMutationInput) -> AppResult<()> {
    Err(AppError::not_implemented("scenarios_add_asset"))
}

/// Mirrors `AgentdockApi.scenarios.removeAsset`.
#[command]
pub async fn scenarios_remove_asset(_input: ScenarioAssetMutationInput) -> AppResult<()> {
    Err(AppError::not_implemented("scenarios_remove_asset"))
}

// =========================================================================
// applications
// =========================================================================

/// Mirrors `AgentdockApi.applications.list`.
#[command]
pub async fn applications_list() -> AppResult<Vec<ApplicationRecord>> {
    Err(AppError::not_implemented("applications_list"))
}

/// Mirrors `AgentdockApi.applications.get`.
#[command]
pub async fn applications_get(_id: ApplicationId) -> AppResult<Option<ApplicationDetail>> {
    Err(AppError::not_implemented("applications_get"))
}

/// Mirrors `AgentdockApi.applications.update`.
#[command]
pub async fn applications_update(
    _id: ApplicationId,
    _input: UpdateApplicationInput,
) -> AppResult<ApplicationRecord> {
    Err(AppError::not_implemented("applications_update"))
}

/// Mirrors `AgentdockApi.applications.refreshLocations`.
#[command]
pub async fn applications_refresh_locations(
    _id: ApplicationId,
) -> AppResult<Vec<ApplicationLocationRecord>> {
    Err(AppError::not_implemented("applications_refresh_locations"))
}

/// Mirrors `AgentdockApi.applications.updateLocation`.
#[command]
pub async fn applications_update_location(
    _id: String,
    _input: UpdateApplicationLocationInput,
) -> AppResult<ApplicationLocationRecord> {
    Err(AppError::not_implemented("applications_update_location"))
}

/// Mirrors `AgentdockApi.applications.runSync`.
#[command]
pub async fn applications_run_sync(_id: ApplicationId) -> AppResult<ApplicationSyncResult> {
    Err(AppError::not_implemented("applications_run_sync"))
}

/// Mirrors `AgentdockApi.applications.previewScenarioSync`.
#[command]
pub async fn applications_preview_scenario_sync(
    _input: ApplicationScenarioSyncInput,
) -> AppResult<SyncPreviewResult> {
    Err(AppError::not_implemented(
        "applications_preview_scenario_sync",
    ))
}

/// Mirrors `AgentdockApi.applications.runScenarioSync`.
#[command]
pub async fn applications_run_scenario_sync(
    _input: ApplicationScenarioSyncInput,
) -> AppResult<SyncRunResult> {
    Err(AppError::not_implemented("applications_run_scenario_sync"))
}

// =========================================================================
// sync
// =========================================================================

/// Mirrors `AgentdockApi.sync.preview`.
#[command]
pub async fn sync_preview(_input: SyncPreviewInput) -> AppResult<SyncPreviewResult> {
    Err(AppError::not_implemented("sync_preview"))
}

/// Mirrors `AgentdockApi.sync.run`.
#[command]
pub async fn sync_run(_input: SyncPreviewInput) -> AppResult<SyncRunResult> {
    Err(AppError::not_implemented("sync_run"))
}

/// Mirrors `AgentdockApi.sync.cleanup`.
#[command]
pub async fn sync_cleanup(_input: SyncCleanupInput) -> AppResult<SyncCleanupResult> {
    Err(AppError::not_implemented("sync_cleanup"))
}

// =========================================================================
// shell (renderer → main window chrome)
// =========================================================================

/// Mirrors `ElectronShellAPI.windowReady`. In the Electron build the
/// main process uses this signal to swap a white-flash guard for the
/// real window content; in the Tauri build the window is shown
/// immediately so this is a fire-and-forget no-op that future shells
/// may subscribe to via `app_handle.emit`.
#[command]
pub async fn window_ready() -> AppResult<()> {
    // Phase 1: nothing to do. The Tauri runtime shows the main window
    // at construction time, so the renderer does not need to gate it.
    Ok(())
}

/// Mirrors `ElectronShellAPI.setOverlay`. Phase 1 returns Ok without
/// touching the OS chrome — the existing `tauri.conf.json` already
/// declares `titleBarStyle: "Overlay"` so the visual default matches
/// the Electron "dark" theme. Phase 2 will route to
/// `WebviewWindow::set_title_bar_style` / platform-specific overlays.
#[command]
pub async fn window_set_overlay(_theme: ShellTheme) -> AppResult<()> {
    Ok(())
}
