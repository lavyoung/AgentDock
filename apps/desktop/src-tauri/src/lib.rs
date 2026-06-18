//! AgentDock desktop — Tauri 2.x entry point.
//!
//! Phase 1 of the Tauri migration: this file boots the runtime, points
//! the window at the existing Vite-built renderer (`../dist`), and
//! registers the **contract-aligned command boundary** declared in
//! `commands.rs`. Each command is a no-op stub returning
//! `AppError::not_implemented("<cmd>")` so the wire shape (command name,
//! DTO shape, return envelope) is real even though the body is not.
//!
//! Phase 2 fills the bodies with the Rust port of
//! `packages/core/src/*` services without changing any wire field — the
//! renderer keeps calling `agentdockClient.<namespace>.<method>` and
//! the contract layer never breaks.
//!
//! The Electron build is kept side-by-side during the dual-track
//! migration; this binary only fires when the user runs `pnpm tauri:dev`
//! or `pnpm tauri:build`.

use tauri::Manager;

mod commands;
mod contract;
mod error;
mod ports;
mod state;

pub use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            // Resolve the same data directory the Electron build uses, so
            // users can switch between the two builds without losing data.
            // Phase 1 only logs the path; the migration to Rust-managed
            // SQLite/registry lands in Phase 2.
            if let Ok(data_dir) = app.path().app_data_dir() {
                log::info!("[agentdock-tauri] app data dir = {}", data_dir.display());
            } else {
                log::warn!("[agentdock-tauri] could not resolve app data dir");
            }
            Ok(())
        })
        .manage(AppState::new())
        // The full command surface is enumerated here so that any
        // command missing from this list fails to register at startup
        // (instead of silently 404ing at the first renderer call).
        .invoke_handler(tauri::generate_handler![
            // app
            commands::app_pick_path,
            // assets
            commands::assets_list,
            commands::assets_get,
            commands::assets_create,
            commands::assets_update,
            commands::assets_set_status,
            commands::assets_delete,
            // rules
            commands::rules_list,
            commands::rules_get,
            commands::rules_create,
            commands::rules_update,
            commands::rules_delete,
            // snapshots
            commands::snapshots_list,
            commands::snapshots_restore,
            // targets
            commands::targets_list,
            commands::targets_get,
            commands::targets_create,
            commands::targets_update,
            commands::targets_delete,
            // scenarios
            commands::scenarios_list,
            commands::scenarios_get,
            commands::scenarios_create,
            commands::scenarios_update,
            commands::scenarios_delete,
            commands::scenarios_add_asset,
            commands::scenarios_remove_asset,
            // applications
            commands::applications_list,
            commands::applications_get,
            commands::applications_update,
            commands::applications_refresh_locations,
            commands::applications_update_location,
            commands::applications_run_sync,
            commands::applications_preview_scenario_sync,
            commands::applications_run_scenario_sync,
            // sync
            commands::sync_preview,
            commands::sync_run,
            commands::sync_cleanup,
            // shell
            commands::window_ready,
            commands::window_set_overlay,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AgentDock (Tauri)");
}
