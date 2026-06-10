//! Application state managed by Tauri at runtime.
//!
//! Phase 1: just a placeholder so `.manage(AppState::new())` compiles.
//! Phase 2: this will own the `DatabasePool` (rusqlite + r2d2), the
//! `FileSystemPort` implementation, and a registry of services that
//! the Tauri commands borrow from via `tauri::State<'_, AppState>`.

#[derive(Default)]
pub struct AppState {
    // r2d2::Pool<r2d2_sqlite::SqliteConnectionManager> lands in Phase 2.
    _private: (),
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
