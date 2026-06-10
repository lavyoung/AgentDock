//! AgentDock desktop — Tauri 2.x entry point.
//!
//! Phase 1 of the Tauri migration: this file only boots the runtime and
//! points the window at the existing Vite-built renderer (`../dist`).
//! Business commands (assets / targets / sync) are added in Phase 2+ once
//! the Rust port of `FileSystemPort` and `DatabasePort` lands.
//!
//! The Electron build is kept side-by-side during the dual-track
//! migration; this binary only fires when the user runs `pnpm tauri:dev`
//! or `pnpm dist:tauri`.

use tauri::Manager;

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
        .run(tauri::generate_context!())
        .expect("error while running AgentDock (Tauri)");
}
