import {type JSX, useCallback, useEffect, useMemo, useState} from "react";

import {getAssetMainFileName} from "../../../../../packages/core/src/types/asset";
import {Button} from "./Button";
import {useI18n} from "../i18n/useI18n";
import {getAssetTypeLabelKey, useAppStore} from "../stores/useAppStore";
import "./Modal.css";

function getLineCount(content: string): number {
    if (content.length === 0) {
        return 0;
    }

    return content.split(/\r?\n/).length;
}

type ReadonlyFieldProps = {
    label: string;
    value: string;
};

function ReadonlyField({label, value}: ReadonlyFieldProps): JSX.Element {
    return (
        <div className="field">
            <label>{label}</label>
            <div className="field-readonly">{value}</div>
        </div>
    );
}

export function DetailPanel(): JSX.Element {
    const open = useAppStore((s) => s.detailPanelOpen);
    const tab = useAppStore((s) => s.detailPanelTab);
    const selectedAsset = useAppStore((s) => s.selectedAsset);
    const editorTitle = useAppStore((s) => s.editorTitle);
    const editorDescription = useAppStore((s) => s.editorDescription);
    const editorContent = useAppStore((s) => s.editorContent);
    const snapshots = useAppStore((s) => s.snapshots);
    const assetDetailLoading = useAppStore((s) => s.assetDetailLoading);
    const snapshotsLoading = useAppStore((s) => s.snapshotsLoading);
    const snapshotsLoadedAssetId = useAppStore((s) => s.snapshotsLoadedAssetId);
    const closeDetailPanel = useAppStore((s) => s.closeDetailPanel);
    const setDetailPanelTab = useAppStore((s) => s.setDetailPanelTab);
    const loadAssetSnapshots = useAppStore((s) => s.loadAssetSnapshots);
    const setEditorTitle = useAppStore((s) => s.setEditorTitle);
    const setEditorDescription = useAppStore((s) => s.setEditorDescription);
    const setEditorContent = useAppStore((s) => s.setEditorContent);
    const saveAsset = useAppStore((s) => s.saveAsset);
    const deleteAsset = useAppStore((s) => s.deleteAsset);
    const restoreSelectedSnapshot = useAppStore((s) => s.restoreSelectedSnapshot);
    const pushToast = useAppStore((s) => s.pushToast);
    const {t, formatDateTime} = useI18n();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClose = useCallback(() => {
        closeDetailPanel();
    }, [closeDetailPanel]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, handleClose]);

    useEffect(() => {
        if (
            open &&
            tab === "history" &&
            selectedAsset &&
            !snapshotsLoading &&
            snapshotsLoadedAssetId !== selectedAsset.id
        ) {
            void loadAssetSnapshots(selectedAsset.id);
        }
    }, [loadAssetSnapshots, open, selectedAsset, snapshotsLoadedAssetId, snapshotsLoading, tab]);

    const assetType = selectedAsset?.type ?? "skill";
    const assetTypeBadgeClass =
        assetType === "agents-md"
            ? "badge badge-purple"
            : assetType === "rule"
                ? "badge badge-orange"
                : "badge badge-blue";
    const assetTypeLabel = t(getAssetTypeLabelKey(assetType));
    const fileName = selectedAsset ? getAssetMainFileName(selectedAsset.type) : "SKILL.md";
    const contentStats = useMemo(() => {
        const template = t("panelContentStats");
        return template
            .replace("{fileName}", fileName)
            .replace("{lines}", String(getLineCount(editorContent)))
            .replace("{characters}", String(editorContent.length));
    }, [editorContent, fileName, t]);

    const isDirty =
        !!selectedAsset &&
        (
            editorTitle !== selectedAsset.title ||
            editorDescription !== selectedAsset.description ||
            editorContent !== selectedAsset.content
        );

    async function handleSave() {
        if (!selectedAsset || isSaving || !isDirty) {
            return;
        }

        try {
            setIsSaving(true);
            await saveAsset();
            pushToast("success", t("savedSuccess"));
        } catch {
            pushToast("error", t("saveFailed"));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!selectedAsset || isDeleting) {
            return;
        }

        if (!window.confirm(t("confirmDeleteAsset"))) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteAsset();
            pushToast("success", t("assetDeleted"));
        } catch {
            pushToast("error", t("assetDeleteFailed"));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div
                className={`panel-backdrop ${open ? "open" : ""}`}
                aria-hidden={!open}
                onClick={handleClose}
            />
            <aside
                className={`detail-panel ${open ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!open}
                tabIndex={-1}
            >
                {assetDetailLoading && !selectedAsset && (
                    <div className="detail-panel-loading" aria-live="polite">
                        <div className="detail-panel-loading-spinner" aria-hidden="true" />
                        <div className="detail-panel-loading-copy">{t("panelLoadingAsset")}</div>
                    </div>
                )}

                {selectedAsset && (
                    <>
                        <header className="detail-panel-header">
                            <div className="panel-title-block">
                                <h2 id="panel-title">{editorTitle}</h2>
                                <div className="panel-subtitle">
                                    <span className={assetTypeBadgeClass}>{assetTypeLabel}</span>
                                    <span>{t("panelVersion")}</span>
                                    <span className="text-white font-medium">
                                        {selectedAsset.version}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="sync-pill synced">
                                        <span className="pill-dot" />
                                        <span>{t("panelSynced")}</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="panel-close"
                                onClick={handleClose}
                                aria-label={t("close")}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </header>

                        <nav role="tablist" aria-label={t("assetView")}>
                            <button
                                type="button"
                                className={`panel-tab ${tab === "overview" ? "active" : ""}`}
                                onClick={() => setDetailPanelTab("overview")}
                                role="tab"
                                aria-selected={tab === "overview"}
                            >
                                {t("panelTabOverview")}
                            </button>
                            <button
                                type="button"
                                className={`panel-tab ${tab === "content" ? "active" : ""}`}
                                onClick={() => setDetailPanelTab("content")}
                                role="tab"
                                aria-selected={tab === "content"}
                            >
                                {t("panelTabContent")}
                            </button>
                            <button
                                type="button"
                                className={`panel-tab ${tab === "history" ? "active" : ""}`}
                                onClick={() => setDetailPanelTab("history")}
                                role="tab"
                                aria-selected={tab === "history"}
                            >
                                {t("panelTabHistory")}
                            </button>
                        </nav>

                        <div className="panel-body">
                            {tab === "overview" && (
                                <div className="panel-pane" role="tabpanel">
                                    <div className="panel-meta-grid">
                                        <ReadonlyField label={t("panelFieldId")} value={selectedAsset.id} />
                                        <ReadonlyField label={t("panelFieldType")} value={assetTypeLabel} />
                                        <ReadonlyField
                                            label={t("panelFieldVersion")}
                                            value={selectedAsset.version}
                                        />
                                        <ReadonlyField
                                            label={t("panelFieldTags")}
                                            value={t("panelNoTags")}
                                        />
                                    </div>
                                    <ReadonlyField
                                        label={t("panelFieldPath")}
                                        value={`${selectedAsset.path}\\current\\${fileName}`}
                                    />
                                    <div className="field">
                                        <label htmlFor="f-title">{t("panelFieldTitle")}</label>
                                        <input
                                            id="f-title"
                                            type="text"
                                            value={editorTitle}
                                            onChange={(e) => setEditorTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="f-desc">{t("panelFieldDescription")}</label>
                                        <textarea
                                            id="f-desc"
                                            rows={3}
                                            value={editorDescription}
                                            onChange={(e) => setEditorDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            {tab === "content" && (
                                <div className="panel-pane" role="tabpanel">
                                    <div className={`editor-meta ${isDirty ? "dirty" : ""}`}>
                                        <span className="dirty-dot" />
                                        <span className="text-zinc-500 text-xs">{contentStats}</span>
                                    </div>
                                    <textarea
                                        className="editor"
                                        spellCheck={false}
                                        aria-label={t("assetContent")}
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                    />
                                </div>
                            )}
                            {tab === "history" && (
                                <div className="panel-pane" role="tabpanel">
                                    <p className="panel-history-desc">{t("panelHistoryDesc")}</p>
                                    {snapshotsLoading ? (
                                        <div className="detail-panel-loading detail-panel-loading-inline" aria-live="polite">
                                            <div className="detail-panel-loading-spinner" aria-hidden="true" />
                                            <div className="detail-panel-loading-copy">{t("panelLoadingHistory")}</div>
                                        </div>
                                    ) : snapshots.length === 0 ? (
                                        <p className="text-zinc-500 text-sm">{t("noSnapshotsYet")}</p>
                                    ) : (
                                        <ul className="snapshot-list">
                                            {snapshots.map((snapshot) => (
                                                <li key={snapshot.id} className="snapshot-item">
                                                    <div>
                                                        <strong>{formatDateTime(snapshot.created_at)}</strong>
                                                    </div>
                                                    <div className="hint">
                                                        {t("snapshotMessageBeforeAssetUpdate")}
                                                    </div>
                                                    <div className="hint mono">
                                                        {snapshot.snapshot_path}
                                                    </div>
                                                    <div>
                                                        <Button
                                                            size="sm"
                                                            onClick={async () => {
                                                                try {
                                                                    await restoreSelectedSnapshot(snapshot.id);
                                                                    pushToast("success", t("snapshotRestored"));
                                                                } catch {
                                                                    pushToast("error", t("snapshotRestoreFailed"));
                                                                }
                                                            }}
                                                        >
                                                            {t("restore")}
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <footer className="panel-footer">
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving}
                            >
                                {t("deleteAsset")}
                            </Button>
                            <div className="panel-footer-actions">
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                    disabled={isDeleting || isSaving}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={!isDirty || isDeleting || isSaving}
                                >
                                    {t("saveAndSnapshot")}
                                </Button>
                            </div>
                        </footer>
                    </>
                )}
            </aside>
        </>
    );
}
