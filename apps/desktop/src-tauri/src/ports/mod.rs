//! Native ports — file system, shell, database.
//!
//! Phase 1: empty module stubs so the binary links. Phase 2 fills the
//! `FileSystemPort` and `ShellPort` traits with real impls (tokio::fs +
//! a `which`-style command lookup). Phase 3 introduces `DatabasePort`
//! + `SqliteDatabase` (rusqlite + r2d2 pool).
//!
//! These traits MUST stay aligned with the TypeScript interfaces in
//! `packages/core/src/ports/`. The contract is the IPC schema in
//! `packages/shared/src/agentdockApi.ts`.

pub mod file_system;
pub mod shell_port;
pub mod database;

pub use database::DatabasePort;
pub use file_system::FileSystemPort;
pub use shell_port::ShellPort;
