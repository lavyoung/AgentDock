//! Database port — native Rust implementation.
//!
//! Phase 1: trait stub. Phase 3 introduces `SqliteDatabase` backed by
//! `r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>` so connections are
//! reusable across Tauri commands.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("not implemented yet (Phase 3)")]
    NotImplemented,
}

#[async_trait::async_trait]
pub trait DatabasePort: Send + Sync {
    // Phase 3: take a `&self`, run a closure with a connection from the
    // pool, and return serde_json::Value / row structs. Bodies land once
    // we port the SQL from `apps/desktop/src/platform/electron/database.ts`.
}
