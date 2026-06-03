import {type JSX, useCallback, useEffect} from "react";

import {Button} from "./Button";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Modal.css";

export function DetailPanel(): JSX.Element {
    const open = useAppStore((s) => s.detailPanelOpen);
    const tab = useAppStore((s) => s.detailPanelTab);
    const selectedAsset = useAppStore((s) => s.selectedAsset);
    const editorTitle = useAppStore((s) => s.editorTitle);
    const editorDescription = useAppStore((s) => s.editorDescription);
    const editorContent = useAppStore((s) => s.editorContent);
    const snapshots = useAppStore((s) => s.snapshots);
    const closeDetailPanel = useAppStore((s) => s.closeDetailPanel);
    const setDetailPanelTab = useAppStore((s) => s.setDetailPanelTab);
    const setEditorTitle = useAppStore((s) => s.setEditorTitle);
    const setEditorDescription = useAppStore((s) => s.setEditorDescription);
    const setEditorContent = useAppStore((s) => s.setEditorContent);
    const saveAsset = useAppStore((s) => s.saveAsset);
    const restoreSelectedSnapshot = useAppStore((s) => s.restoreSelectedSnapshot);
    const pushToast = useAppStore((s) => s.pushToast);
    const {t, formatDateTime} = useI18n();

    const handleClose = useCallback(() => {
        closeDetailPanel();
    }, [closeDetailPanel]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) handleClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, handleClose]);

    const assetType = (selectedAsset?.type ?? "skill") as string;
    const assetTypeBadgeClass =
        assetType === "agents-md"
            ? "badge badge-purple"
            : assetType === "rule"
                ? "badge badge-orange"
                : "badge badge-blue";

    const assetTypeLabel =
        assetType === "agents-md"
            ? "AGENTS.md"
            : assetType === "rule"
                ? "Rule"
                : "Skill";

    async function handleSave() {
        try {
            await saveAsset();
            pushToast("success", t("savedSuccess"));
        } catch {
            pushToast("error", t("saveFailed"));
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
                                    <span className="text-zinc-600">·</span>
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
                                    <div className="panel-actions">
                                        <Button variant="primary" onClick={handleSave}>
                                            {t("save")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {tab === "content" && (
                                <div className="panel-pane" role="tabpanel">
                                    <div className="editor-meta">
                                        <span className="text-zinc-500 text-xs">
                                            SKILL.md · {editorContent.split("\n").length} �?·{" "}
                                            {editorContent.length} 字符
                                        </span>
                                    </div>
                                    <textarea
                                        className="editor"
                                        spellCheck={false}
                                        aria-label={t("assetContent")}
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                    />
                                    <div className="panel-actions">
                                        <Button variant="primary" onClick={handleSave}>
                                            {t("save")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {tab === "history" && (
                                <div className="panel-pane" role="tabpanel">
                                    <p className="panel-history-desc">{t("panelHistoryDesc")}</p>
                                    {snapshots.length === 0 ? (
                                        <p className="text-zinc-500 text-sm">{t("noSnapshotsYet")}</p>
                                    ) : (
                                        <ul className="snapshot-list">
                                            {snapshots.map((s) => (
                                                <li key={s.id} className="snapshot-item">
                                                    <div>
                                                        <strong>{formatDateTime(s.created_at)}</strong>
                                                    </div>
                                                    <div className="hint">{t("snapshotMessageBeforeAssetUpdate")}</div>
                                                    <div className="hint mono">{s.snapshot_path}</div>
                                                    <div>
                                                        <Button
                                                            size="sm"
                                                            onClick={async () => {
                                                                try {
                                                                    await restoreSelectedSnapshot(s.id);
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
                    </>
                )}
            </aside>
        </>
    );
}
