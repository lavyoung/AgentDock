//! Native ports — file system, database, checksums.
//!
//! Phase 1: empty module stubs so the binary links. Phase 2 introduces
//! the `FileSystemPort` trait + `NativeFileSystemPort` impl (tokio::fs
//! + sha2). Phase 3 introduces `DatabasePort` + `SqliteDatabase`
//! (rusqlite + r2d2 pool).
//!
//! These traits MUST stay aligned with the TypeScript interfaces in
//! `packages/core/src/ports/`. The contract is the IPC schema in
//! `packages/shared/src/agentdockApi.ts`.

pub mod file_system;
pub mod database;

pub use file_system::FileSystemPort;
pub use database::DatabasePort;
