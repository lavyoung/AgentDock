//! Application-level error type for Tauri commands.
//!
//! Wire format (must stay aligned with the renderer's expectation):
//!
//! ```json
//! { "kind": "not_implemented", "message": "assets_list" }
//! ```
//!
//! The renderer should branch on `kind` rather than parse `message`. New
//! `kind` values land here first, then on the renderer side via the
//! shared contract — never the other way around.

use serde::{Deserialize, Serialize};

/// Stable identifier of the error category. Renderers use this to decide
/// retry / surface / fallback semantics without parsing the message.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorKind {
    /// Command exists on the wire but its body is not wired yet.
    /// Mirrors Phase 1 of the Tauri port (commands.rs is intentionally
    /// stubbed). The renderer should treat this as "feature not
    /// available yet" and fall back to mock / cached data where possible.
    NotImplemented,
    /// Catch-all for unexpected Rust-side failures. Renderer should
    /// surface a generic error toast.
    Internal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppError {
    pub kind: ErrorKind,
    pub message: String,
}

impl AppError {
    /// Standard "not implemented yet" reply. Used by every stub command.
    pub fn not_implemented(command: impl Into<String>) -> Self {
        Self {
            kind: ErrorKind::NotImplemented,
            message: format!("{}: not implemented yet (Phase 1 stub)", command.into()),
        }
    }

    /// Wrap an internal failure with a stable kind so the renderer can
    /// branch without inspecting the message.
    pub fn internal(message: impl Into<String>) -> Self {
        Self {
            kind: ErrorKind::Internal,
            message: message.into(),
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{:?}: {}", self.kind, self.message)
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::internal(format!("io error: {}", error))
    }
}

impl From<serde_json::Error> for AppError {
    fn from(error: serde_json::Error) -> Self {
        AppError::internal(format!("serde error: {}", error))
    }
}

// `Result` alias so command bodies can be written without repeating the
// error type. Keep this private to the crate — nothing outside should
// reference it.
pub(crate) type AppResult<T> = Result<T, AppError>;
