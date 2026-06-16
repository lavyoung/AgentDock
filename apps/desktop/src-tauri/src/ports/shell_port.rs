//! Shell port — native Rust implementation.
//!
//! Phase 1: trait stub so the binary links. Phase 2 fills `command_exists`
//! with a `which`-style lookup (e.g. spawning `which` on Unix, `where.exe`
//! on Windows). The trait shape mirrors
//! `packages/core/src/ports/shellPort.ts` 1:1.

use async_trait::async_trait;

#[async_trait]
pub trait ShellPort: Send + Sync {
    /// Returns true when `command` resolves to an executable on the
    /// current PATH. Implementations must never panic and should return
    /// false on any lookup failure so callers can use it as a soft probe.
    async fn command_exists(&self, _command: &str) -> bool {
        false
    }
}
