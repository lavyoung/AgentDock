//! File system port — native Rust implementation.
//!
//! Phase 1: trait + stub methods so the binary links. Phase 2 fills the
//! bodies with `tokio::fs` calls and a `sha2` checksum. The trait shape
//! mirrors `packages/core/src/ports/fileSystemPort.ts` 1:1.

use async_trait::async_trait;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FsError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("path is empty")]
    EmptyPath,
    #[error("not implemented yet (Phase 2)")]
    NotImplemented,
}

#[async_trait]
pub trait FileSystemPort: Send + Sync {
    async fn exists(&self, _path: &str) -> Result<bool, FsError> {
        Err(FsError::NotImplemented)
    }
    async fn read_text(&self, _path: &str) -> Result<String, FsError> {
        Err(FsError::NotImplemented)
    }
    async fn write_text(&self, _path: &str, _content: &str) -> Result<(), FsError> {
        Err(FsError::NotImplemented)
    }
    async fn ensure_dir(&self, _path: &str) -> Result<(), FsError> {
        Err(FsError::NotImplemented)
    }
    async fn copy_file(&self, _from: &str, _to: &str) -> Result<(), FsError> {
        Err(FsError::NotImplemented)
    }
    async fn copy_dir(&self, _from: &str, _to: &str) -> Result<(), FsError> {
        Err(FsError::NotImplemented)
    }
    async fn remove(&self, _path: &str) -> Result<(), FsError> {
        Err(FsError::NotImplemented)
    }
    async fn checksum(&self, _path: &str) -> Result<String, FsError> {
        Err(FsError::NotImplemented)
    }
}
